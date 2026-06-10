import api from '@/services/api'

function getData(res) {
  return res.data?.data ?? res.data
}

function mapNotif(n) {
  return {
    id: n.id_notification ?? n.id,
    title: n.titre ?? n.title ?? '',
    message: n.message ?? '',
    isRead: n.est_lue ?? n.isRead ?? false,
    createdAt: n.date_creation ?? n.createdAt ?? '',
    type: n.type_notification ?? n.type ?? 'GENERAL',
  }
}

function mapComment(m) {
  return {
    id: m.id_commentaire ?? m.id,
    content: m.contenu ?? m.message ?? '',
    senderRole: m.auteur?.role === 'PROFESSIONNEL' ? 'PROFESSIONAL' : (m.auteur?.role ?? 'STUDENT'),
    senderName: m.auteur ? `${m.auteur.prenom ?? ''} ${m.auteur.nom ?? ''}`.trim() : '',
    senderPhoto: m.auteur?.photo ?? null,
    createdAt: m.date_creation ?? m.createdAt ?? '',
  }
}

function mapAction(a) {
  return {
    id: a.id_historique ?? a.id,
    description: a.description ?? a.action ?? '',
    type: a.type_action ?? a.type ?? 'GENERAL',
    entity: a.entite ?? a.entity ?? '',
    details: a.details ?? '',
    createdAt: a.date_creation ?? a.createdAt ?? '',
  }
}

// ── Profile ──

export async function getProfessionalProfile() {
  const res = await api.get('/auth/me')
  return getData(res)
}

export async function updateProfessionalProfile(data) {
  const res = await api.put('/auth/me', data)
  return getData(res)
}

// ── Notifications ──

export async function getProfessionalNotifications() {
  const res = await api.get('/notifications/')
  const data = getData(res)
  const list = Array.isArray(data) ? data : []
  return { notifications: list.map(mapNotif) }
}

export async function markProfessionalNotificationAsRead(notificationId) {
  await api.put(`/notifications/${notificationId}/lire`)
}

export async function markAllProfessionalNotificationsAsRead() {
  const res = await api.get('/notifications/')
  const data = getData(res)
  const list = Array.isArray(data) ? data : []
  await Promise.allSettled(
    list.filter(n => !n.est_lue).map(n => api.put(`/notifications/${n.id_notification ?? n.id}/lire`))
  )
}

// ── Historique ──

export async function getProfessionalActionHistory() {
  const res = await api.get('/historique-actions/mes-actions')
  const data = getData(res)
  const list = Array.isArray(data) ? data : []
  return { actions: list.map(mapAction) }
}

function mapRecommendation(r) {
  return {
    id: r.id_recommandation ?? r.id,
    studentName: r.etudiant ? `${r.etudiant.prenom ?? ''} ${r.etudiant.nom ?? ''}`.trim() : (r.nom_etudiant ?? ''),
    message: r.message ?? r.contenu ?? '',
    status: r.statut ?? r.status ?? 'EN_ATTENTE',
    createdAt: r.date_creation ?? r.createdAt ?? '',
  }
}

// ── Recommandations ──

export async function getMyIssuedRecommendations() {
  const res = await api.get('/recommandations/mes-recommandations-emises')
  const data = getData(res)
  const list = Array.isArray(data) ? data : []
  return { recommendations: list.map(mapRecommendation) }
}

export async function createProfessionalRecommendation(payload) {
  const res = await api.post('/recommandations/', {
    id_etudiant: payload?.studentId ?? '',
    message: payload?.message ?? '',
  })
  return getData(res)
}

export async function deleteProfessionalRecommendation(recommendationId) {
  await api.delete(`/recommandations/${recommendationId}`)
}

// ── Commentaires ──

export async function getProfessionalComments(studentId) {
  const res = await api.get(`/commentaires/public/etudiant/${studentId}`)
  const data = getData(res)
  return { comments: (Array.isArray(data) ? data : []).map(mapComment) }
}

export async function createProfessionalComment(payload) {
  const res = await api.post('/commentaires/', {
    id_etudiant_cible: payload?.studentId ?? '',
    contenu: payload?.content ?? '',
    type_cible: payload?.typeCible ?? 'PROFIL',
  })
  const data = getData(res)
  return { comment: mapComment(data ?? {}) }
}

export async function deleteProfessionalComment(commentId) {
  await api.delete(`/commentaires/${commentId}`)
}

// ── Stages ──

export async function getProfessionalInternships() {
  const res = await api.get('/stages/')
  const data = getData(res)
  return Array.isArray(data) ? data : []
}

// ── Projets ──

export async function getProfessionalProjects() {
  const res = await api.get('/projets/')
  const data = getData(res)
  return Array.isArray(data) ? data : []
}

// ── Portfolio ──

export async function getPortfolioTemplates() {
  const res = await api.get('/portfolio/templates')
  const data = getData(res)
  return Array.isArray(data) ? data : []
}
