import api from '@/services/api'

// ─── Helper : libellé du poste selon le rôle de l'auteur ─────────────────────
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
    auteur: {
      nom:        'Dupont',
      prenom:     'Marie',
      role:       'PROFESSIONNEL',
      poste:      'Responsable RH',
      entreprise: 'TechCorp',
    },
  },
  {
    id_recommandation: 'rec2',
    message:           'Excellent travail en équipe, très bon niveau technique.',
    status:            'VALIDE',
    auteur: {
      nom:         'Martin',
      prenom:      'Jean',
      role:        'PROFESSEUR',
      specialite:  'Génie logiciel',
      departement: 'SIC',
    },
  },
]

// ─── Helper interne : vérifie si un tableau est vide ou invalide ──────────────
function isEmpty(value) {
  if (value === null || value === undefined) return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

// ─── fetchStats ───────────────────────────────────────────────────────────────
export async function fetchStats(idEtudiant) {
  try {
    const res      = await api.get(`/api/etudiants/${idEtudiant}`)
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

    // Si tous les champs sont undefined/null → API n'inclut pas encore ces données
    const allEmpty = Object.values(result).every(v => v === undefined || v === null)
    if (allEmpty) {
      console.warn('[fetchStats] champs manquants dans la réponse → mock')
      return MOCK_STATS
    }

    // Fallback champ par champ si certains manquent
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
    const res  = await api.get('/api/projets/')
    const data = Array.isArray(res.data?.data) ? res.data.data
               : Array.isArray(res.data)        ? res.data
               : null  // null = réponse invalide

    // Réponse invalide ou vide
    if (isEmpty(data)) {
      console.warn('[fetchProjects] réponse vide ou invalide → mock')
      return MOCK_PROJECTS
    }

    const filtered = data.reduce((acc, projet) => {
      if (!Array.isArray(projet.participations)) return acc
      const participation = projet.participations.find(
        p => p.id_etudiant === idEtudiant
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

    // Après filtrage : aucun projet pour cet étudiant → mock
    if (isEmpty(filtered)) {
      console.warn('[fetchProjects] aucun projet pour cet étudiant → mock')
      return MOCK_PROJECTS
    }

    return filtered
  } catch (err) {
    console.error('[fetchProjects] erreur API → mock', err)
    return MOCK_PROJECTS
  }
}

// ─── fetchRecos ───────────────────────────────────────────────────────────────
// ⚠️  GET /api/recommandations/etudiant/{id} absent de la spec — à créer backend
export async function fetchRecos(idEtudiant) {
  try {
    const res  = await api.get(`/api/recommandations/etudiant/${idEtudiant}?status=VALIDE`)
    const data = Array.isArray(res.data?.data) ? res.data.data
               : Array.isArray(res.data)        ? res.data
               : null

    if (isEmpty(data)) {
      console.warn('[fetchRecos] réponse vide → mock')
      return MOCK_RECOS
    }

    const valides = data.filter(r => r.status === 'VALIDE')

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