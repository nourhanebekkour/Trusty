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
  const response = await api.put(`/notifications/${id}/lire`)
  return extractData(response)
}

export async function markAllNotificationsAsRead() {
  const notifications = await getAdminNotifications()
  const unread = Array.isArray(notifications)
    ? notifications.filter(notification => !notification.est_lue)
    : []

  await Promise.all(unread.map(notification =>
    markNotificationAsRead(notification.id_notification)
  ))

  return { updated: unread.length }
}

export async function deleteNotification(id) {
  return {
    id,
    skipped: true,
    message: 'API manquante: suppression de notification non exposee cote backend.',
  }
}
