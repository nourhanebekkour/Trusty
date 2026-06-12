import api from '@/services/api'

function extractData(response) {
  const data = response?.data?.data ?? response?.data ?? []
  return Array.isArray(data) ? data : []
}

function extractPortfolioSlug(value) {
  if (typeof value !== 'string' || !value.trim()) return ''

  const trimmed = value.trim()
  const portfolioMatch = trimmed.match(/\/portfolio\/([^/?#]+)/)
  if (portfolioMatch?.[1]) return decodeURIComponent(portfolioMatch[1])

  if (!trimmed.includes('/')) return trimmed
  return ''
}

export async function getStudentNotifications() {
  const response = await api.get('/notifications/')
  return extractData(response).sort((a, b) => {
    if (a.est_lue !== b.est_lue) return a.est_lue ? 1 : -1
    return new Date(b.date_creation) - new Date(a.date_creation)
  })
}

export async function markStudentNotificationAsRead(notificationId) {
  await api.put(`/notifications/${notificationId}/lire`)
}

export async function markAllStudentNotificationsAsRead(notifications) {
  const unread = (notifications || []).filter(notification => !notification.est_lue)
  await Promise.all(
    unread.map(notification =>
      markStudentNotificationAsRead(notification.id_notification ?? notification.id)
    )
  )
}

export async function resolveStudentNotificationTarget(notification) {
  if (!notification) return null

  if (notification.type_notification !== 'COMMENTAIRE') {
    return notification.lien_action || null
  }

  const directSlug =
    extractPortfolioSlug(notification.portfolioSlug) ||
    extractPortfolioSlug(notification.portfolioUrl) ||
    extractPortfolioSlug(notification.url_publique) ||
    extractPortfolioSlug(notification.lien_action)

  if (directSlug) {
    return `/portfolio/${encodeURIComponent(directSlug)}#comments`
  }

  const response = await api.get('/portfolio/me')
  const portfolios = extractData(response)
  const targetStudentId =
    notification.studentId ||
    notification.id_etudiant ||
    notification.id_etudiant_cible ||
    notification.lien_action?.match(/^\/profil\/([^/?#]+)/)?.[1]

  const portfolio =
    portfolios.find(item => targetStudentId && item.id_etudiant === targetStudentId) ||
    portfolios.find(item => item.est_publie) ||
    portfolios[0]

  return portfolio?.url_publique
    ? `/portfolio/${encodeURIComponent(portfolio.url_publique)}#comments`
    : null
}
