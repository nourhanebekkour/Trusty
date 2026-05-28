import api from './api.js'

// ── Projets ───────────────────────────────────────────────────────────────────
export async function fetchProjetsAValider() {
  const { data } = await api.get('/projets/a-valider')
  return data.data ?? []
}

export async function validerProjet(id_projet, decision, commentaire = '', appreciation = '') {
  const { data } = await api.post(`/projets/${id_projet}/valider`, {
    decision,
    commentaire,
    appreciation,
  })
  return data.data
}

// ── Stages ────────────────────────────────────────────────────────────────────
export async function fetchStagesAValider() {
  const { data } = await api.get('/stages/a-valider')
  return data.data ?? []
}

export async function validerStage(id_stage, decision, commentaire = '') {
  const { data } = await api.post(`/stages/${id_stage}/valider`, {
    decision,
    commentaire,
  })
  return data.data
}

// ── Notifications ─────────────────────────────────────────────────────────────
export async function fetchNotifications() {
  const { data } = await api.get('/notifications')
  return data.data ?? []
}

export async function marquerNotificationLue(id_notification) {
  await api.put(`/notifications/${id_notification}/lire`)
}
