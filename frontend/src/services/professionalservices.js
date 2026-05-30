import api from './api.js'

function extractData(response) {
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.data?.data)) return response.data.data
  return response?.data?.data ?? response?.data ?? []
}

function uniqueById(items) {
  const seen = new Set()
  return items.filter(item => {
    if (!item?.id_etudiant || seen.has(item.id_etudiant)) return false
    seen.add(item.id_etudiant)
    return true
  })
}

const fallbackCandidats = [
  {
    id_etudiant: 'demo-thomas',
    filiere: 'Ingenierie Logicielle',
    ville: 'Tanger',
    score_credibilite: 88,
    biographie: 'Architecture cloud, Docker, Kubernetes et projets fullstack valides.',
    utilisateur: { prenom: 'Thomas', nom: 'Bernard' },
  },
  {
    id_etudiant: 'demo-lea',
    filiere: 'Design Numerique',
    ville: 'Tetouan',
    score_credibilite: 94,
    biographie: 'UX/UI, prototypes mobiles et portfolio public complet.',
    utilisateur: { prenom: 'Lea', nom: 'Martin' },
  },
  {
    id_etudiant: 'demo-alex',
    filiere: 'Data Science',
    ville: 'Al Hoceima',
    score_credibilite: 76,
    biographie: 'Analyse de donnees, NLP et projets d aide a la decision.',
    utilisateur: { prenom: 'Alexandre', nom: 'Gauthier' },
  },
]

export async function fetchCandidats() {
  try {
    const [stagesResult, projetsResult] = await Promise.allSettled([
      api.get('/stages'),
      api.get('/projets'),
    ])

    const stages = stagesResult.status === 'fulfilled' ? extractData(stagesResult.value) : []
    const projets = projetsResult.status === 'fulfilled' ? extractData(projetsResult.value) : []

    const stageStudents = stages.map(stage => stage.etudiant).filter(Boolean)
    const projectStudents = projets.flatMap(project =>
      (project.participations || []).map(participation => participation.etudiant).filter(Boolean)
    )

    const candidates = uniqueById([...stageStudents, ...projectStudents])
    return candidates.length ? candidates : fallbackCandidats
  } catch {
    return fallbackCandidats
  }
}

export async function envoyerRecommandation(id_etudiant, message) {
  const { data } = await api.post('/recommandations', { id_etudiant, message })
  return data.data
}

export async function fetchNotifications() {
  try {
    const response = await api.get('/notifications')
    return extractData(response)
  } catch {
    return []
  }
}

export async function marquerNotificationLue(id_notification) {
  await api.put(`/notifications/${id_notification}/lire`)
}
