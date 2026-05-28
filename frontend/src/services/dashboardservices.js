import api from '@/api'

// ─── Helper extraction ────────────────────────────────────────────────────────
function extractData(res) {
  const body = res?.data ?? res
  // L'API retourne { success, message, data: [...] } ou directement [...]
  if (body?.data !== undefined) return body.data
  return body
}

function isEmpty(value) {
  if (value === null || value === undefined) return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

// ─── Helper affichage auteur ──────────────────────────────────────────────────
export function getAuteurLabel(auteur) {
  if (!auteur) return ''
  const role = auteur.role ?? auteur.utilisateur?.role

  if (role === 'PROFESSIONNEL') {
    const poste     = auteur.poste     ?? auteur.professionnel?.poste
    const entreprise = auteur.entreprise ?? auteur.professionnel?.entreprise
    return [poste, entreprise].filter(Boolean).join(' · ')
  }
  if (role === 'PROFESSEUR') {
    const specialite  = auteur.specialite  ?? auteur.professeur?.specialite
    const departement = auteur.departement ?? auteur.professeur?.departement
    return [specialite, departement].filter(Boolean).join(' · ')
  }
  if (role === 'ETUDIANT') {
    const filiere = auteur.filiere ?? auteur.etudiant?.filiere
    const annee   = auteur.annee   ?? auteur.etudiant?.annee
    return [filiere, annee ? `Année ${annee}` : null].filter(Boolean).join(' · ')
  }
  return sanitize(auteur.poste)
}

// ─── Normalise un objet recommandation quelle que soit la forme API ──────────
// L'API peut retourner :
//   { id_recommandation, message, status, auteur: { nom, prenom, role, ... } }
// ou :
//   { id_recommandation, message, status,
//     recommandeur: { nom, prenom, role, professeur: {...}, professionnel: {...} } }
function normalizeReco(r) {
  // Extraire l'auteur depuis toutes les formes possibles
  const raw = r.auteur ?? r.recommandeur ?? r.utilisateur ?? null

  let auteur = null
  if (raw) {
    // Construire un objet auteur plat avec les infos disponibles
    const u = raw.utilisateur ?? raw  // si l'API imbrique utilisateur dans recommandeur
    auteur = {
      nom:    u.nom    ?? raw.nom    ?? '',
      prenom: u.prenom ?? raw.prenom ?? '',
      photo:  u.photo  ?? raw.photo  ?? null,
      role:   u.role   ?? raw.role   ?? '',
      // Détails selon le rôle — aplatir depuis les sous-objets si présents
      poste:        raw.professionnel?.poste        ?? raw.poste        ?? u.professionnel?.poste        ?? null,
      entreprise:   raw.professionnel?.entreprise   ?? raw.entreprise   ?? u.professionnel?.entreprise   ?? null,
      specialite:   raw.professeur?.specialite      ?? raw.specialite   ?? u.professeur?.specialite      ?? null,
      departement:  raw.professeur?.departement     ?? raw.departement  ?? u.professeur?.departement     ?? null,
      filiere:      raw.etudiant?.filiere            ?? raw.filiere      ?? u.etudiant?.filiere            ?? null,
    }
  }

  return {
    id_recommandation: r.id_recommandation,
    message:           r.message ?? '',
    status:            r.status  ?? 'EN_ATTENTE',
    date_creation:     r.date_creation ?? null,
    auteur,
  }
}

// ─── Mock data (fallback seulement si API inaccessible) ──────────────────────
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
    date_creation:     new Date().toISOString(),
    auteur: { nom: 'Dupont', prenom: 'Marie', role: 'PROFESSIONNEL', poste: 'Responsable RH', entreprise: 'TechCorp', photo: null },
  },
  {
    id_recommandation: 'rec2',
    message:           'Excellent travail en équipe, très bon niveau technique.',
    status:            'VALIDE',
    date_creation:     new Date().toISOString(),
    auteur: { nom: 'Martin', prenom: 'Jean', role: 'PROFESSEUR', specialite: 'Génie logiciel', departement: 'SIC', photo: null },
  },
]

// ─── fetchStats ───────────────────────────────────────────────────────────────
export async function fetchStats(idEtudiant) {
  assertPositiveInt(idEtudiant, 'idEtudiant')

  try {
    const res      = await api.get(`/etudiants/${idEtudiant}`)
    const etudiant = extractData(res)

    if (isEmpty(etudiant)) {
      console.warn('[fetchStats] réponse vide → mock')
      return MOCK_STATS
    }

    return {
      projetsCertifies: etudiant._count?.participations_projets ?? MOCK_STATS.projetsCertifies,
      credibilite:      etudiant.score_credibilite               ?? MOCK_STATS.credibilite,
      vuesProfil:       etudiant.portfolio?.nombre_vues          ?? MOCK_STATS.vuesProfil,
      recommandations:  etudiant._count?.recommendation          ?? MOCK_STATS.recommandations,
    }
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
    const data = extractData(res)

    if (!Array.isArray(data) || isEmpty(data)) {
      console.warn('[fetchProjects] réponse vide → mock')
      return MOCK_PROJECTS
    }

    const filtered = data.reduce((acc, projet) => {
      const parts       = projet.participations ?? projet.participants ?? []
      const participation = parts.find(
        (p) => p.id_etudiant === idEtudiant || p.id_utilisateur === idEtudiant
      )
      if (!participation)                                return acc
      if (participation.est_visible_portfolio === false) return acc

      acc.push({
        ...projet,
        est_visible_portfolio: participation.est_visible_portfolio ?? true,
        est_createur:          participation.est_createur          ?? false,
        role_joue:             participation.role_joue             ?? '',
      })
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
/**
 * Récupère les recommandations reçues par un étudiant.
 *
 * Stratégie à deux niveaux :
 *   1. GET /recommandations/mes-recommandations-recus  (utilisateur connecté)
 *      → endpoint le plus précis, retourne uniquement les recommandations de l'étudiant connecté
 *      → inclut toutes les recommandations (EN_ATTENTE, VALIDE, REJETE)
 *
 *   2. GET /recommandations/public/etudiant/{id}  (fallback)
 *      → endpoint public, retourne uniquement les recommandations VALIDE
 *      → utile si le premier endpoint échoue ou si on consulte un autre profil
 *
 * Les deux réponses sont normalisées via normalizeReco() pour gérer
 * les différentes structures possibles retournées par le backend.
 */
export async function fetchRecos(idEtudiant) {
  // ── Tentative 1 : endpoint "mes recommandations reçues" (connecté) ──────────
  try {
    const res  = await api.get('/recommandations/mes-recommandations-recus')
    const data = extractData(res)

    if (Array.isArray(data) && !isEmpty(data)) {
      const normalized = data.map(normalizeReco)
      // Séparer : VALIDE en premier, puis EN_ATTENTE, puis le reste
      const sorted = [
        ...normalized.filter(r => r.status === 'VALIDE'),
        ...normalized.filter(r => r.status === 'EN_ATTENTE'),
        ...normalized.filter(r => r.status !== 'VALIDE' && r.status !== 'EN_ATTENTE'),
      ]
      console.info(`[fetchRecos] ${sorted.length} reco(s) chargée(s) via /mes-recommandations-recus`)
      return sorted
    }

    console.warn('[fetchRecos] /mes-recommandations-recus vide → fallback public')
  } catch (err) {
    console.warn('[fetchRecos] /mes-recommandations-recus échoué → fallback public', err?.response?.status)
  }

  // ── Tentative 2 : endpoint public (VALIDE uniquement) ──────────────────────
  try {
    const res  = await api.get(`/recommandations/public/etudiant/${idEtudiant}`)
    const data = extractData(res)

    if (Array.isArray(data) && !isEmpty(data)) {
      const normalized = data.map(normalizeReco).filter(r => r.status === 'VALIDE')
      console.info(`[fetchRecos] ${normalized.length} reco(s) publique(s) chargée(s)`)
      return normalized
    }

    console.warn('[fetchRecos] endpoint public vide → mock')
    return MOCK_RECOS
  } catch (err) {
    console.error('[fetchRecos] les deux endpoints ont échoué → mock', err)
    return MOCK_RECOS
  }
}