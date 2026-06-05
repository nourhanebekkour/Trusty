import api from '@/services/api'

function extractData(response) {
  if (Array.isArray(response.data)) {
    return response.data
  }

  if (Array.isArray(response.data?.data)) {
    return response.data.data
  }

  return response.data?.data || response.data
}

export async function getAdminNotifications() {
  const response = await api.get('/notifications')
  return extractData(response)
}

export async function markNotificationAsRead(id) {
  const response = await api.patch(`/notifications/${id}/read`)
  return extractData(response)
}

export async function markAllNotificationsAsRead() {
  const response = await api.patch('/notifications/read-all')
  return extractData(response)
}

export async function deleteNotification(id) {
  const response = await api.delete(`/notifications/${id}`)
  return extractData(response)
}