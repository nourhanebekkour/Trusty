import api from '@/services/api'

function getData(response) {
  return response.data?.data || response.data
}

/*
|--------------------------------------------------------------------------
| Dashboard professeur
|--------------------------------------------------------------------------
*/

export async function getProfessorDashboard() {
  const response = await api.get('/professor/dashboard')
  return getData(response)
}

export async function getProfessorStudents(params = {}) {
  const response = await api.get('/professor/students', { params })
  return getData(response)
}

/*
|--------------------------------------------------------------------------
| Validations professeur
|--------------------------------------------------------------------------
*/

export async function getProfessorPendingValidations(params = {}) {
  const response = await api.get('/professor/validations/pending', { params })
  return getData(response)
}

export async function getProfessorValidations(params = {}) {
  const response = await api.get('/professor/validations', { params })
  return getData(response)
}

export async function approveProfessorValidation(validationId) {
  const response = await api.patch(`/professor/validations/${validationId}/approve`)
  return getData(response)
}

export async function requestProfessorChanges(validationId, payload) {
  const response = await api.patch(
    `/professor/validations/${validationId}/request-changes`,
    payload
  )

  return getData(response)
}

/*
|--------------------------------------------------------------------------
| Portfolios professeur
|--------------------------------------------------------------------------
*/

export async function getProfessorPortfolios(params = {}) {
  const response = await api.get('/professor/portfolios', { params })
  return getData(response)
}

export async function getProfessorPortfolioDetails(portfolioId) {
  const response = await api.get(`/professor/portfolios/${portfolioId}`)
  return getData(response)
}

export async function validateProfessorPortfolio(portfolioId) {
  const response = await api.patch(`/professor/portfolios/${portfolioId}/validate`)
  return getData(response)
}

export async function requestPortfolioChanges(portfolioId, payload) {
  const response = await api.patch(
    `/professor/portfolios/${portfolioId}/request-changes`,
    payload
  )

  return getData(response)
}

export async function exportProfessorPortfolioPdf(portfolioId) {
  const response = await api.get(`/professor/portfolios/${portfolioId}/pdf`, {
    responseType: 'blob',
  })

  return response.data
}

export async function certifyProfessorPortfolio(studentId) {
  const response = await api.patch(`/professor/students/${studentId}/certify-portfolio`)
  return getData(response)
}

/*
|--------------------------------------------------------------------------
| Messages professeur
|--------------------------------------------------------------------------
*/

export async function getProfessorConversations() {
  const response = await api.get('/professor/messages/conversations')
  return getData(response)
}

export async function getProfessorConversationMessages(conversationId) {
  const response = await api.get(`/professor/messages/conversations/${conversationId}`)
  return getData(response)
}

export async function sendProfessorConversationMessage(conversationId, payload) {
  const response = await api.post(
    `/professor/messages/conversations/${conversationId}`,
    payload
  )

  return getData(response)
}

export async function sendProfessorMessage(studentId, payload) {
  const response = await api.post(`/professor/students/${studentId}/messages`, payload)
  return getData(response)
}

/*
|--------------------------------------------------------------------------
| Notifications professeur
|--------------------------------------------------------------------------
*/

export async function getProfessorNotifications(params = {}) {
  const response = await api.get('/professor/notifications', { params })
  return getData(response)
}

export async function markProfessorNotificationAsRead(notificationId) {
  const response = await api.patch(`/professor/notifications/${notificationId}/read`)
  return getData(response)
}

export async function markAllProfessorNotificationsAsRead() {
  const response = await api.patch('/professor/notifications/read-all')
  return getData(response)
}

export async function deleteProfessorNotification(notificationId) {
  const response = await api.delete(`/professor/notifications/${notificationId}`)
  return getData(response)
}

/*
|--------------------------------------------------------------------------
| Recommandations professeur
|--------------------------------------------------------------------------
*/

export async function getProfessorRecommendations(params = {}) {
  const response = await api.get('/professor/recommendations', { params })
  return getData(response)
}

export async function createProfessorRecommendationRequest(payload) {
  const response = await api.post('/professor/recommendations', payload)
  return getData(response)
}

export async function createProfessorRecommendation(studentId, payload) {
  const response = await api.post(
    `/professor/students/${studentId}/recommendations`,
    payload
  )

  return getData(response)
}

export async function updateProfessorRecommendation(recommendationId, payload) {
  const response = await api.patch(
    `/professor/recommendations/${recommendationId}`,
    payload
  )

  return getData(response)
}