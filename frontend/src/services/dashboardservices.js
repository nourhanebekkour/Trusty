import api from '@/api'

// ─── Helper ───────────────────────────

const VALID_ROLES = ['PROFESSIONNEL', 'PROFESSEUR', 'ETUDIANT', 'ADMIN']

export function getAuteurLabel(auteur) {
  if (!auteur || typeof auteur !== 'object') return ''

  // Validation du rôle avant de lire des champs dépendants du rôle
  const role = typeof auteur.role === 'string' ? auteur.role.toUpperCase() : ''
  if (!VALID_ROLES.includes(role)) return ''

  const sanitize = (val) =>
    typeof val === 'string'
      ? val.trim().replace(/[\u0000-\u001F\u007F]/g, '').slice(0, 200)
      : ''

  if (role === 'PROFESSIONNEL') {
    return [sanitize(auteur.poste), sanitize(auteur.entreprise)].filter(Boolean).join(' · ')
  }
  if (role === 'PROFESSEUR') {
    return [sanitize(auteur.specialite), sanitize(auteur.departement)].filter(Boolean).join(' · ')
  }
  return sanitize(auteur.poste)
}

// ─── Mock data ────────────────────
const MOCK_STATS = {
  projetsCertifies: 4,
  credibilite:      78,
  vuesProfil:       123,
  recommandations:  6,
}

const MOCK_PROJECTS = [
  {
    id_projet:             'proj1',
    titre:                 'Application de gestion RH',
    type_projet:           'MODULE',
    status_validation:     'VALIDE',
    date_debut:            '2024-09-01T00:00:00.000Z',
    description:           "Développement d'une application full-stack de gestion des ressources humaines.",
    est_visible_portfolio: true,
    est_createur:          true,
    role_joue:             'Développeur fullstack',
    technologies: [
      { technologie: { nom: 'React'   } },
      { technologie: { nom: 'Node.js' } },
    ],
  },
  {
    id_projet:             'proj2',
    titre:                 'Dashboard Analytics',
    type_projet:           'PFA',
    status_validation:     'EN_ATTENTE',
    date_debut:            '2025-01-15T00:00:00.000Z',
    description:           "Création d'un tableau de bord interactif pour visualiser des données.",
    est_visible_portfolio: true,
    est_createur:          true,
    role_joue:             'Lead frontend',
    technologies: [
      { technologie: { nom: 'Python' } },
      { technologie: { nom: 'Vue.js' } },
    ],
  },
]

const MOCK_RECOS = [
  {
    id_recommandation: 'rec1',
    message:           'Étudiant sérieux et très impliqué dans ses projets. Je recommande vivement.',
    status:            'VALIDE',
    auteur: { nom: 'Dupont', prenom: 'Marie', role: 'PROFESSIONNEL', poste: 'Responsable RH', entreprise: 'TechCorp' },
  },
  {
    id_recommandation: 'rec2',
    message:           'Excellent travail en équipe, très bon niveau technique.',
    status:            'VALIDE',
    auteur: { nom: 'Martin', prenom: 'Jean', role: 'PROFESSEUR', specialite: 'Génie logiciel', departement: 'SIC' },
  },
]

// ─── Helper interne ──────────────────────

function isEmpty(value) {
  if (value === null || value === undefined) return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Vérifie qu'une valeur est un identifiant entier positif.
 */
const assertPositiveInt = (val, label) => {
  if (!Number.isInteger(val) || val <= 0) {
    throw new TypeError(`[dashboardService] ${label} doit être un entier positif, reçu : ${val}`)
  }
}

/** Filtre les stats pour n'exposer que les champs numériques attendus. */
const sanitizeStats = (raw) => ({
  projetsCertifies: Number.isFinite(raw.projetsCertifies) ? raw.projetsCertifies : MOCK_STATS.projetsCertifies,
  credibilite:      Number.isFinite(raw.credibilite)      ? raw.credibilite      : MOCK_STATS.credibilite,
  vuesProfil:       Number.isFinite(raw.vuesProfil)       ? raw.vuesProfil       : MOCK_STATS.vuesProfil,
  recommandations:  Number.isFinite(raw.recommandations)  ? raw.recommandations  : MOCK_STATS.recommandations,
})

/** Filtre les champs autorisés d'un projet retourné par l'API. */
const PROJET_ALLOWED_FIELDS = [
  'id_projet', 'titre', 'type_projet', 'status_validation',
  'date_debut', 'description', 'est_visible_portfolio',
  'est_createur', 'role_joue', 'technologies', 'participations', 'participants',
]

const sanitizeProjet = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  return PROJET_ALLOWED_FIELDS.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(raw, key)) acc[key] = raw[key]
    return acc
  }, Object.create(null))
}

/** Filtre les champs autorisés d'une recommandation retournée par l'API. */
const RECO_ALLOWED_FIELDS = ['id_recommandation', 'message', 'status', 'auteur', 'createdAt']
const sanitizeReco = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  return RECO_ALLOWED_FIELDS.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(raw, key)) acc[key] = raw[key]
    return acc
  }, Object.create(null))
}

// ─── fetchStats ──────────────
export async function fetchStats(idEtudiant) {
  assertPositiveInt(idEtudiant, 'idEtudiant')

  try {
    const res      = await api.get(`/etudiants/${idEtudiant}`)
    const etudiant = res.data?.data ?? res.data

    if (isEmpty(etudiant)) {
      console.warn('[fetchStats] réponse vide → mock')
      return MOCK_STATS
    }

    const result = {
      projetsCertifies: etudiant._count?.participations_projets,
      credibilite:      etudiant.score_credibilite,
      vuesProfil:       etudiant.portfolio?.nombre_vues,
      recommandations:  etudiant._count?.recommendation,
    }

    const allEmpty = Object.values(result).every(v => v === undefined || v === null)
    if (allEmpty) {
      console.warn('[fetchStats] champs manquants → mock')
      return MOCK_STATS
    }

    return sanitizeStats(result)
  } catch (err) {
    console.error('[fetchStats] erreur API → mock', err)
    return MOCK_STATS
  }
}

// ─── fetchProjects ────────────────
export async function fetchProjects(idEtudiant) {
  assertPositiveInt(idEtudiant, 'idEtudiant')

  try {
    const res  = await api.get('/projets/')
    const data = Array.isArray(res.data?.data) ? res.data.data
               : Array.isArray(res.data)        ? res.data
               : null

    if (isEmpty(data)) {
      console.warn('[fetchProjects] réponse vide → mock')
      return MOCK_PROJECTS
    }

    const filtered = data.reduce((acc, projet) => {
      if (!projet || typeof projet !== 'object') return acc

      const parts = Array.isArray(projet.participations) ? projet.participations
                  : Array.isArray(projet.participants)   ? projet.participants
                  : []

      const participation = parts.find(
        p => p?.id_etudiant === idEtudiant || p?.id_utilisateur === idEtudiant
      )

      if (!participation)                                return acc
      if (participation.est_visible_portfolio === false) return acc

      const safe = sanitizeProjet(projet)
      if (!safe) return acc

      safe.est_visible_portfolio = participation.est_visible_portfolio ?? true
      safe.est_createur          = participation.est_createur          ?? false
      safe.role_joue             = typeof participation.role_joue === 'string'
        ? participation.role_joue.slice(0, 150)
        : ''

      acc.push(safe)
      return acc
    }, [])

    if (isEmpty(filtered)) {
      console.warn('[fetchProjects] aucun projet → mock')
      return MOCK_PROJECTS
    }

    return filtered
  } catch (err) {
    console.error('[fetchProjects] erreur API → mock', err)
    return MOCK_PROJECTS
  }
}

// ─── fetchRecos ───────────────────────────────────────────────────────────────

// Liste blanche des statuts de recommandation acceptés
const VALID_RECO_STATUSES = ['VALIDE', 'EN_ATTENTE', 'REJETE']

export async function fetchRecos(idEtudiant) {
  assertPositiveInt(idEtudiant, 'idEtudiant')

  try {
    const res  = await api.get(`/recommandations/public/etudiant/${idEtudiant}`)
    const data = Array.isArray(res.data?.data) ? res.data.data
               : Array.isArray(res.data)        ? res.data
               : null

    if (isEmpty(data)) {
      console.warn('[fetchRecos] réponse vide → mock')
      return MOCK_RECOS
    }

    const valides = data
      .filter(r =>
        r &&
        typeof r === 'object' &&
        // Validation du statut par liste blanche avant comparaison
        VALID_RECO_STATUSES.includes(r.status) &&
        r.status === 'VALIDE'
      )
      .map(sanitizeReco)
      .filter(Boolean)

    if (isEmpty(valides)) {
      console.warn('[fetchRecos] aucune reco VALIDE → mock')
      return MOCK_RECOS
    }

    return valides
  } catch (err) {
    console.error('[fetchRecos] erreur API → mock', err)
    return MOCK_RECOS
  }
}