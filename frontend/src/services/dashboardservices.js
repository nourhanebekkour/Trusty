import api from '@/services/api'

// ─── Mocks ────────────────────────────────────────────────────────────────────
// À supprimer quand le backend est prêt + passer API_READY à true

const API_READY = false  // ← mettre true quand le backend est déployé

const MOCK_STATS = {
  projetsCertifies: 4,
  credibilite:      78,
  vuesProfil:       123,
  recommandations:  6,
}

const MOCK_PROJECTS = [
  {
    id: '1',
    titre: 'Application de gestion RH',
    type: 'Développement Web',
    statut: 'Certifié',
    dateDebut: '2024-09-01',
    description: "Développement d'une application full-stack de gestion des ressources humaines.",
    tags: ['React', 'Node.js'],
  },
  {
    id: '2',
    titre: 'Dashboard Analytics',
    type: 'Data Science',
    statut: 'En cours',
    dateDebut: '2025-01-15',
    description: "Création d'un tableau de bord interactif pour visualiser des données.",
    tags: ['Python', 'Vue.js'],
  },
]

const MOCK_RECOS = [
  {
    id: '1',
    contenu: 'Étudiant sérieux et très impliqué dans ses projets. Je recommande vivement.',
    auteur: { nom: 'Marie Dupont', poste: 'Responsable RH - TechCorp' },
  },
  {
    id: '2',
    contenu: 'Excellent travail en équipe, très bon niveau technique.',
    auteur: { nom: 'Jean Martin', poste: 'CTO - StartupXYZ' },
  },
]

// ─── Services ─────────────────────────────────────────────────────────────────

export async function fetchStats() {
  if (!API_READY) return MOCK_STATS
  try {
    const res = await api.get('/dashboard/stats')
    return res.data
  } catch {
    return MOCK_STATS
  }
}

export async function fetchProjects() {
  if (!API_READY) return MOCK_PROJECTS
  try {
    const res = await api.get('/projets')
    return Array.isArray(res.data) ? res.data : []
  } catch {
    return MOCK_PROJECTS
  }
}

export async function fetchRecos() {
  if (!API_READY) return MOCK_RECOS
  try {
    const res = await api.get('/recommandations')
    return Array.isArray(res.data) ? res.data : []
  } catch {
    return MOCK_RECOS
  }
}

