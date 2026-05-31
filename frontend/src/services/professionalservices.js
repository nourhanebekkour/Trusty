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

function mergeCandidateSources(candidates) {
  const byId = new Map()

  candidates.forEach(candidate => {
    if (!candidate?.id_etudiant) return

    const existing = byId.get(candidate.id_etudiant) || {}
    const sources = new Set([...(existing.sources || []), ...(candidate.sources || [])])

    byId.set(candidate.id_etudiant, {
      ...existing,
      ...candidate,
      sources: [...sources],
    })
  })

  return uniqueById([...byId.values()])
}

export async function fetchCandidats() {
  try {
    const [stagesResult, projetsResult] = await Promise.allSettled([
      api.get('/stages'),
      api.get('/projets'),
    ])

    const stages = stagesResult.status === 'fulfilled' ? extractData(stagesResult.value) : []
    const projets = projetsResult.status === 'fulfilled' ? extractData(projetsResult.value) : []

    const stageStudents = stages
      .map(stage => stage.etudiant && {
        ...stage.etudiant,
        sources: ['STAGE'],
        last_activity_label: stage.poste || stage.entreprise || 'Stage',
      })
      .filter(Boolean)

    const projectStudents = projets.flatMap(project =>
      (project.participations || [])
        .map(participation => participation.etudiant && {
          ...participation.etudiant,
          sources: ['PROJET'],
          last_activity_label: project.titre || 'Projet',
        })
        .filter(Boolean)
    )

    return mergeCandidateSources([...stageStudents, ...projectStudents])
  } catch {
    return []
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
