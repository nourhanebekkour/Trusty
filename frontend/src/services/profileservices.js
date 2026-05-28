import api from './api.js'

// ─── GitHub API ──────────────────────────────────────────────────────────────

const GH_API = 'https://api.github.com'

/**
 * Récupère les dépôts publics d'un utilisateur GitHub.
 * @param {string} username
 * @returns {Promise<Array>} Liste de dépôts formatés
 */
export async function fetchGithubRepos(username) {
  if (!username) return []
  try {
    const res = await fetch(
      `${GH_API}/users/${username}/repos?per_page=6&sort=updated&type=public`,
      { headers: { Accept: 'application/vnd.github+json' } }
    )
    if (!res.ok) throw new Error(`GitHub API: ${res.status}`)
    const repos = await res.json()
    return repos.map((r) => ({
      id_depot:            r.id.toString(),
      nom_depot:           r.name,
      url_github:          r.html_url,
      description_github:  r.description ?? '',
      nombre_commits:      null, // nécessite un appel séparé /repos/{owner}/{repo}/commits
      langage_principal:   r.language ?? null,
      date_dernier_commit: r.pushed_at ?? null,
      stargazers_count:    r.stargazers_count,
      forks_count:         r.forks_count,
      topics:              r.topics ?? [],
      is_fork:             r.fork,
    }))
  } catch (err) {
    console.warn('[fetchGithubRepos] Erreur GitHub API :', err.message)
    return []
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractData(res) {
  const body = res?.data ?? res
  return body?.data ?? body
}


const REC_ALLOWED_FIELDS = ['id', 'id_etudiant', 'message', 'createdAt', 'auteur']
const sanitizeRecommandation = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  return REC_ALLOWED_FIELDS.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(raw, key)) {
      acc[key] = raw[key]
    }
    return acc
  }, Object.create(null))
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function getProfile() {
  try {
    // 1. Récupérer l'utilisateur connecté
    const meRes = await api.get('/auth/me')
    const me    = extractData(meRes)
    const id    = me.id_utilisateur

    // 2. Récupérer profil étudiant, compétences, badges en parallèle
    const [etudiantRes, competencesRes, badgesRes, projetsRes] = await Promise.allSettled([
      api.get(`/etudiants/${id}`),
      api.get(`/competences/etudiant/${id}`),
      api.get(`/badges/etudiant/${id}`),
      // Projets via participations — l'étudiant est identifié par son id utilisateur
      api.get(`/projets/`), // on filtrera côté client ou via un endpoint dédié
    ])

    const etudiant = etudiantRes.status    === 'fulfilled' ? extractData(etudiantRes.value)    : {}
    const competences = competencesRes.status === 'fulfilled' ? (extractData(competencesRes.value) ?? []) : []
    const badgesRaw   = badgesRes.status   === 'fulfilled' ? extractData(badgesRes.value)      : null
    const badges      = badgesRaw?.badges ?? badgesRaw ?? []

    // 3. Récupérer les dépôts GitHub via l'API GitHub si username disponible
    const githubUsername = etudiant?.github_username
    const depots = await fetchGithubRepos(githubUsername)

    // 4. Récupérer les participations projets de l'étudiant
    let projets = []
    try {
      const ppRes = await api.get(`/projets/`) // adapter si endpoint dédié existe
      const allProjets = extractData(ppRes) ?? []
      // Filtrer les projets où l'étudiant participe (selon la structure de l'API)
      projets = Array.isArray(allProjets) ? allProjets : []
    } catch {
      projets = []
    }

    return { data: assembleUser(me, etudiant, competences, badges, projets, depots) }
  } catch (err) {
    console.error('[getProfile] Erreur API :', err)
    throw err
  }
}

// ─── Sauvegarde profil ───────────────────────────────────────────────────────

export async function saveProfile(id, formData) {
  // Séparer les champs utilisateur des champs étudiant
  const {
    prenom, nom, telephone,
    // champs système à exclure
    score_credibilite, niveau_credibilite, id_validateur,
    id_etudiant, id_utilisateur, role, date_creation,
    date_modification, email_verifie, status_compte,
    ...etudiantFields
  } = formData

  // Nettoyage : supprimer les champs vides optionnels
  const cleanEtudiantFields = Object.fromEntries(
    Object.entries(etudiantFields).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  )

  if (!cleanEtudiantFields.filiere) cleanEtudiantFields.filiere = 'GINF'

  // Mise à jour du profil étudiant
  const etudiantRes = await api.put(`/etudiants/${id}`, cleanEtudiantFields)
  const etudiant    = extractData(etudiantRes)

  // Rechargement complet après sauvegarde
  const [meRes, competencesRes, badgesRes] = await Promise.all([
    api.get('/auth/me'),
    api.get(`/competences/etudiant/${id}`),
    api.get(`/badges/etudiant/${id}`),
  ])

  const me          = extractData(meRes)
  const competences = extractData(competencesRes) ?? []
  const badgesRaw   = extractData(badgesRes)
  const badges      = badgesRaw?.badges ?? badgesRaw ?? []

  // Re-fetch GitHub avec le nouveau username (si modifié)
  const githubUsername = cleanEtudiantFields.github_username ?? etudiant?.github_username
  const depots = await fetchGithubRepos(githubUsername)

  return { data: assembleUser(me, etudiant, competences, badges, [], depots) }
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

export async function uploadAvatar(id, file) {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post(`/etudiants/${id}/avatar`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return { data: extractData(res) }
}

// ─── Compétences ─────────────────────────────────────────────────────────────

/**
 * Ajoute une compétence existante du catalogue à un étudiant.
 * Si la compétence n'existe pas encore, elle est créée dans le catalogue d'abord.
 */
export async function addSkill(idEtudiant, nom, niveau_maitrise = 'DEBUTANT', type = 'TECHNIQUE') {
  // 1. Vérifier si la compétence existe déjà dans le catalogue
  let competence
  try {
    const listRes  = await api.get('/competences/')
    const catalog  = extractData(listRes) ?? []
    const existing = catalog.find((c) => c.nom.toLowerCase() === nom.toLowerCase())
    if (existing) {
      competence = existing
    } else {
      // Créer dans le catalogue
      const createRes = await api.post('/competences/', { nom, type, categorie: type === 'TECHNIQUE' ? 'Technique' : 'Soft Skills' })
      competence = extractData(createRes)
    }
  } catch {
    // Fallback : tenter de créer directement
    const createRes = await api.post('/competences/', { nom, type })
    competence = extractData(createRes)
  }

  // 2. Associer la compétence à l'étudiant
  const assocRes = await api.post(
    `/competences/etudiant/${idEtudiant}/${competence.id_competence}`,
    { niveau_maitrise }
  )
  const assoc = extractData(assocRes)

  return {
    data: {
      competence,
      niveau_maitrise: assoc?.niveau_maitrise ?? niveau_maitrise,
      date_ajout: assoc?.date_ajout ?? new Date().toISOString(),
    },
  }
}

/**
 * Retire une compétence d'un étudiant.
 */
export async function removeSkill(idEtudiant, idCompetence) {
  await api.delete(`/competences/etudiant/${idEtudiant}/${idCompetence}`)
}

// ─── Projets ─────────────────────────────────────────────────────────────────

/**
 * Récupère les participations projets d'un étudiant.
 * L'API ne semble pas avoir d'endpoint dédié etudiant/{id}/projets,
 * donc on récupère tous les projets et on filtre.
 * À adapter si un endpoint dédié est disponible.
 */
export async function getStudentProjects(idEtudiant) {
  try {
    // Tenter d'abord via l'endpoint formations (pattern similaire)
    // L'endpoint idéal serait /projets/etudiant/{id} — à vérifier avec le backend
    const res = await api.get(`/projets/`)
    const projets = extractData(res) ?? []
    // Filtrer les projets où l'étudiant est participant
    return Array.isArray(projets)
      ? projets.filter((p) =>
          p.participations?.some((pp) => pp.id_etudiant === idEtudiant)
        )
      : []
  } catch (err) {
    console.warn('[getStudentProjects] :', err.message)
    return []
  }
}