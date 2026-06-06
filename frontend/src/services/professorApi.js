import api from '@/services/api'

function getData(res) {
  return res.data?.data ?? res.data
}

async function _fetchStudentsFromValidations() {
  const [projetsRes, stagesRes] = await Promise.allSettled([
    api.get('/projets/a-valider'),
    api.get('/stages/a-valider'),
  ])
  const projets = projetsRes.status === 'fulfilled' ? (getData(projetsRes.value) ?? []) : []
  const stages = stagesRes.status === 'fulfilled' ? (getData(stagesRes.value) ?? []) : []
  const map = new Map()
  ;(Array.isArray(projets) ? projets : []).forEach(p =>
    (p.participations ?? []).forEach(({ etudiant: e }) => {
      if (e?.id_etudiant) map.set(e.id_etudiant, e)
    })
  )
  ;(Array.isArray(stages) ? stages : []).forEach(s => {
    const e = s.etudiant
    if (e?.id_etudiant) map.set(e.id_etudiant, e)
  })
  return [...map.values()]
}

function mapNotif(n) {
  return {
    id: n.id_notification,
    title: n.titre,
    message: n.message,
    isRead: n.est_lue,
    date: n.date_creation,
    type: n.type_notification,
    lien: n.lien_action,
  }
}

function mapEtudiant(e) {
  const u = e.utilisateur ?? {}
  const prenom = u.prenom ?? ''
  const nom = u.nom ?? ''
  return {
    id: e.id_etudiant,
    fullName: `${prenom} ${nom}`.trim() || 'Étudiant',
    email: u.email ?? '',
    field: e.filiere ?? '',
    level: e.annee ? `Année ${e.annee}` : '',
    bio: e.biographie ?? '',
    progress: e.score_credibilite ?? 0,
    portfolioStatus: e.score_credibilite >= 80 ? 'Certifié' : 'En attente',
    portfolioUrl: e.portfolio?.url_publique ?? null,
    avatar: u.photo ?? null,
  }
}

function mapValidation(item, type) {
  const etudiant = type === 'projet'
    ? item.participations?.[0]?.etudiant
    : item.etudiant
  const u = etudiant?.utilisateur ?? {}
  const prenom = u.prenom ?? ''
  const nom = u.nom ?? ''
  return {
    id: item.id_projet || item.id_stage || item.id,
    type,
    title: item.titre || item.entreprise || item.nom_activite || 'Élément',
    studentId: etudiant?.id_etudiant,
    studentName: `${prenom} ${nom}`.trim() || 'Étudiant',
    date: item.date_soumission || item.date_demande || item.date_creation || '',
    status: item.status_validation || 'EN_ATTENTE',
    description: item.description || item.missions || '',
  }
}

function mapRecommandation(r) {
  const u = r.cible?.utilisateur ?? {}
  return {
    id: r.id_recommandation,
    studentName: `${u.prenom ?? ''} ${u.nom ?? ''}`.trim() || 'Étudiant',
    referentName: r.auteur ? `${r.auteur.prenom ?? ''} ${r.auteur.nom ?? ''}`.trim() : '',
    context: r.message?.slice(0, 60) ?? '',
    message: r.message ?? '',
    status: r.status ?? 'EN_ATTENTE',
    date: r.date_creation,
  }
}

function mapPortfolio(e) {
  const mapped = mapEtudiant(e)
  return {
    ...mapped,
    id: e.id_etudiant,
    studentName: mapped.fullName,
    portfolioStatus: mapped.portfolioStatus,
    lastUpdate: e.portfolio?.date_derniere_maj ?? null,
  }
}

function mapMessage(m) {
  return {
    id: m.id_commentaire || m.id,
    content: m.contenu || m.message || '',
    senderRole: m.auteur?.role === 'PROFESSEUR' ? 'PROFESSOR' : 'STUDENT',
    senderName: m.auteur ? `${m.auteur.prenom ?? ''} ${m.auteur.nom ?? ''}`.trim() : '',
    createdAt: m.date_creation,
  }
}

export async function getProfessorDashboard() {
  const [projetsRes, stagesRes] = await Promise.allSettled([
    api.get('/projets/a-valider'),
    api.get('/stages/a-valider'),
  ])
  const projets = projetsRes.status === 'fulfilled' ? (getData(projetsRes.value) ?? []) : []
  const stages = stagesRes.status === 'fulfilled' ? (getData(stagesRes.value) ?? []) : []
  const etudiants = await _fetchStudentsFromValidations()
  const students = etudiants.map(mapEtudiant)
  const validations = [
    ...(Array.isArray(projets) ? projets : []).map(p => mapValidation(p, 'projet')),
    ...(Array.isArray(stages) ? stages : []).map(s => mapValidation(s, 'stage')),
  ]
  return {
    stats: {
      studentsCount: students.length,
      pendingValidationsCount: validations.length,
      certificationsCount: 0,
      averageDelay: null,
    },
    students,
    validations,
  }
}

export async function getProfessorStudents() {
  const etudiants = await _fetchStudentsFromValidations()
  return etudiants.map(mapEtudiant)
}

export async function getProfessorPendingValidations(params = {}) {
  const [projetsRes, stagesRes] = await Promise.allSettled([
    api.get('/projets/a-valider', { params }),
    api.get('/stages/a-valider', { params }),
  ])
  const projets = projetsRes.status === 'fulfilled' ? (getData(projetsRes.value) ?? []) : []
  const stages = stagesRes.status === 'fulfilled' ? (getData(stagesRes.value) ?? []) : []
  return [
    ...(Array.isArray(projets) ? projets : []).map(p => mapValidation(p, 'projet')),
    ...(Array.isArray(stages) ? stages : []).map(s => mapValidation(s, 'stage')),
  ]
}

export async function getProfessorValidations(params = {}) {
  const items = await getProfessorPendingValidations(params)
  return {
    validations: items,
    stats: {
      pendingCount: items.filter(v => v.status === 'EN_ATTENTE').length,
      approvedCount: items.filter(v => v.status === 'VALIDE').length,
      changesRequestedCount: items.filter(v => v.status === 'REJETE').length,
    },
  }
}

export async function approveProfessorValidation(validationId, type = 'projet') {
  const endpoint = type === 'stage' ? `/stages/${validationId}/valider` : `/projets/${validationId}/valider`
  await api.post(endpoint, { decision: 'VALIDE' })
}

export async function requestProfessorChanges(validationId, payload, type = 'projet') {
  const endpoint = type === 'stage' ? `/stages/${validationId}/valider` : `/projets/${validationId}/valider`
  await api.post(endpoint, {
    decision: 'REJETE',
    commentaire: payload?.reason ?? '',
  })
}

export async function getProfessorPortfolios() {
  const etudiants = await _fetchStudentsFromValidations()
  const portfolios = etudiants.map(e => {
    const m = mapEtudiant(e)
    return {
      ...m,
      id: e.id_etudiant,
      studentName: m.fullName,
      title: `Portfolio de ${m.fullName}`,
      description: m.bio,
      lastUpdate: e.portfolio?.date_derniere_maj ?? null,
      portfolioUrl: m.portfolioUrl,
      status: e.portfolio?.est_publie ? 'PUBLIE' : 'BROUILLON',
      submittedAt: e.portfolio?.date_publication ?? null,
      templateName: null,
    }
  })
  return {
    portfolios,
    stats: {
      totalPortfolios: portfolios.length,
      pendingPortfolios: portfolios.filter(p => p.status === 'BROUILLON').length,
      certifiedPortfolios: portfolios.filter(p => p.status === 'PUBLIE').length,
      activeCriteria: 0,
    },
  }
}

export async function getProfessorPortfolioDetails(portfolioId) {
  const etudiants = await _fetchStudentsFromValidations()
  const e = etudiants.find(s => s.id_etudiant === portfolioId)
  if (!e) return null
  const m = mapEtudiant(e)
  return {
    ...m,
    id: e.id_etudiant,
    studentName: m.fullName,
    title: `Portfolio de ${m.fullName}`,
    description: m.bio,
    lastUpdate: e.portfolio?.date_derniere_maj ?? null,
    portfolioUrl: m.portfolioUrl,
    status: e.portfolio?.est_publie ? 'PUBLIE' : 'BROUILLON',
    submittedAt: e.portfolio?.date_publication ?? null,
  }
}

export async function exportProfessorPortfolioPdf() {
  return null
}

export async function getProfessorConversations() {
  const etudiants = await _fetchStudentsFromValidations()
  return {
    conversations: (Array.isArray(etudiants) ? etudiants : []).map(e => ({
      id: e.id_etudiant,
      studentName: `${(e.utilisateur?.prenom ?? '')} ${(e.utilisateur?.nom ?? '')}`.trim() || 'Étudiant',
      lastMessage: '',
      lastDate: null,
      unread: 0,
    })),
  }
}

export async function getProfessorConversationMessages(conversationId) {
  try {
    const res = await api.get(`/commentaires/public/etudiant/${conversationId}`)
    const data = getData(res)
    return {
      messages: (Array.isArray(data) ? data : []).map(mapMessage),
    }
  } catch {
    return { messages: [] }
  }
}

export async function sendProfessorConversationMessage(conversationId, payload) {
  const res = await api.post('/commentaires/', {
    id_etudiant_cible: conversationId,
    contenu: payload?.content ?? '',
    type_cible: 'PROFIL',
  })
  const data = getData(res)
  return { message: mapMessage(data ?? {}) }
}

export async function sendProfessorMessage(studentId, payload) {
  await api.post('/commentaires/', {
    id_etudiant_cible: studentId,
    contenu: payload?.message ?? '',
    type_cible: 'PROFIL',
  })
}

export async function getProfessorNotifications(params = {}) {
  const res = await api.get('/notifications/', { params })
  const data = getData(res)
  const list = Array.isArray(data) ? data : []
  return {
    notifications: list.map(mapNotif),
  }
}

export async function markProfessorNotificationAsRead(notificationId) {
  await api.put(`/notifications/${notificationId}/lire`)
}

export async function markAllProfessorNotificationsAsRead() {
  const res = await api.get('/notifications/')
  const data = getData(res)
  const list = Array.isArray(data) ? data : []
  await Promise.allSettled(
    list.filter(n => !n.est_lue).map(n => api.put(`/notifications/${n.id_notification}/lire`))
  )
}

export async function deleteProfessorNotification(notificationId) {
  await api.put(`/notifications/${notificationId}/lire`)
}

export async function getProfessorRecommendations() {
  return { recommendations: [], stats: { total: 0, completed: 0, pending: 0 } }
}

export async function createProfessorRecommendationRequest(payload) {
  const res = await api.post('/recommandations/', {
    id_etudiant: payload?.studentId ?? '',
    message: payload?.message ?? '',
  })
  return getData(res)
}

export async function createProfessorRecommendation(studentId, payload) {
  const res = await api.post('/recommandations/', {
    id_etudiant: studentId,
    message: payload?.message ?? '',
  })
  return getData(res)
}

export async function updateProfessorRecommendation(recommendationId, payload) {
  await api.patch(`/recommandations/${recommendationId}/valider`, {
    status: payload?.status ?? 'VALIDE',
  })
}
