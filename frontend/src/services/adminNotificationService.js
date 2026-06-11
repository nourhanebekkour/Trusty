import api from '@/services/api'

function extractData(response) {
  if (Array.isArray(response.data)) return response.data
  if (Array.isArray(response.data?.data)) return response.data.data
  return response.data?.data || response.data
}

export async function getAdminNotifications() {
  const response = await api.get('/notifications/')
  return extractData(response)
}

export async function markNotificationAsRead(id) {
  const response = await api.put(`/notifications/${id}/lire`)
  return extractData(response)
}

export async function markAllNotificationsAsRead(notifications) {
  const results = await Promise.allSettled(
    (notifications || [])
      .filter(n => !n.est_lue)
      .map(n => markNotificationAsRead(n.id_notification || n.id))
  )
  return results.filter(r => r.status === 'fulfilled').length
}

export async function deleteNotification(id) {
  await api.delete(`/notifications/${id}`)
}
