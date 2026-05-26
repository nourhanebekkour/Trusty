import api from '@/services/api'

// ─── Helper ───────────────────────────────────────────────────────────────────
export function getAuteurLabel(auteur) {
  if (!auteur) return ''
  if (auteur.role === 'PROFESSIONNEL') {
    return [auteur.poste, auteur.entreprise].filter(Boolean).join(' · ')
  }
  if (auteur.role === 'PROFESSEUR') {
    return [auteur.specialite, auteur.departement].filter(Boolean).join(' · ')
  }
  return auteur.poste ?? ''
}

// ─── Mock data ────────────────────────────────────────────────────────────────
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
    auteur: { nom: 'Martin', prenom: 'Jean', role: 'PROFESSEUR', poste: 'Professeur', specialite: 'Génie logiciel', departement: 'SIC' },
  },
]

function normalizeProject(project) {
  const tags = Array.isArray(project.tags)
    ? project.tags
    : (project.technologies ?? []).map(item => item.technologie?.nom ?? item.nom ?? item).filter(Boolean)

  const statut = project.statut ?? ({
    VALIDE: 'Certifié',
    EN_ATTENTE: 'En attente',
    REJETE: 'Rejeté',
  }[project.status_validation] ?? project.status_validation)

  return {
    ...project,
    id: project.id ?? project.id_projet,
    type: project.type ?? project.type_projet,
    statut,
    dateDebut: project.dateDebut ?? project.date_debut,
    tags,
  }
}

function normalizeReco(reco) {
  const auteur = reco.auteur ?? {}
  return {
    ...reco,
    id: reco.id ?? reco.id_recommandation,
    auteur: {
      ...auteur,
      poste: auteur.poste ?? auteur.specialite ?? auteur.role ?? '',
    },
  }
}

function isEmpty(value) {
  if (value === null || value === undefined) return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

// ─── fetchStats ───────────────────────────────────────────────────────────────
export async function fetchStats(idEtudiant) {
  try {
    // ← '/etudiants/...' sans '/api/' (déjà dans baseURL)
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

    return {
      projetsCertifies: result.projetsCertifies ?? MOCK_STATS.projetsCertifies,
      credibilite:      result.credibilite      ?? MOCK_STATS.credibilite,
      vuesProfil:       result.vuesProfil       ?? MOCK_STATS.vuesProfil,
      recommandations:  result.recommandations  ?? MOCK_STATS.recommandations,
    }
  } catch (err) {
    console.error('[fetchStats] erreur API → mock', err)
    return MOCK_STATS
  }
}

// ─── fetchProjects ────────────────────────────────────────────────────────────
export async function fetchProjects(idEtudiant) {
  try {
    const res  = await api.get('/projets/')
    const data = Array.isArray(res.data?.data) ? res.data.data
               : Array.isArray(res.data)        ? res.data
               : null

    if (isEmpty(data)) {
      console.warn('[fetchProjects] réponse vide → mock')
      return MOCK_PROJECTS.map(normalizeProject)
    }

    const filtered = data.reduce((acc, projet) => {
    const parts = projet.participations ?? projet.participants ?? []
    const participation = parts.find(p => p.id_etudiant === idEtudiant || p.id_utilisateur === idEtudiant)
      if (!participation) return acc
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
      return MOCK_PROJECTS.map(normalizeProject)
    }

    return filtered.map(normalizeProject)
  } catch (err) {
    console.error('[fetchProjects] erreur API → mock', err)
    return MOCK_PROJECTS.map(normalizeProject)
  }
}

// ─── fetchRecos ───────────────────────────────────────────────────────────────
export async function fetchRecos(idEtudiant) {
  try {
    const res  = await api.get(`/recommandations/public/etudiant/${idEtudiant}`)
    const data = Array.isArray(res.data?.data) ? res.data.data
               : Array.isArray(res.data)        ? res.data
               : null

    if (isEmpty(data)) {
      console.warn('[fetchRecos] réponse vide → mock')
      return MOCK_RECOS.map(normalizeReco)
    }

    const valides = data.filter(r => r.status === 'VALIDE')
    if (isEmpty(valides)) {
      console.warn('[fetchRecos] aucune reco VALIDE → mock')
      return MOCK_RECOS.map(normalizeReco)
    }

    return valides.map(normalizeReco)
  } catch (err) {
    console.error('[fetchRecos] erreur API → mock', err)
    return MOCK_RECOS.map(normalizeReco)
  }
}
