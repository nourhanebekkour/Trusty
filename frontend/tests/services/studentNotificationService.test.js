import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}))

import api from '@/services/api'
import {
  getStudentNotifications,
  markStudentNotificationAsRead,
  resolveStudentNotificationTarget,
} from '@/services/studentNotificationService'

describe('studentNotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reloads and sorts notifications from the existing API', async () => {
    api.get.mockResolvedValue({
      data: {
        data: [
          { id_notification: 'old', est_lue: true, date_creation: '2026-06-10T10:00:00Z' },
          { id_notification: 'new', est_lue: false, date_creation: '2026-06-11T10:00:00Z' },
        ],
      },
    })

    const notifications = await getStudentNotifications()

    expect(api.get).toHaveBeenCalledWith('/notifications/')
    expect(notifications.map(item => item.id_notification)).toEqual(['new', 'old'])
  })

  it('marks a notification as read with the existing endpoint', async () => {
    api.put.mockResolvedValue({ data: { success: true } })

    await markStudentNotificationAsRead('notification-1')

    expect(api.put).toHaveBeenCalledWith('/notifications/notification-1/lire')
  })

  it('uses an existing portfolio slug directly', async () => {
    const target = await resolveStudentNotificationTarget({
      type_notification: 'COMMENTAIRE',
      portfolioSlug: 'marguerite-lucas-new',
    })

    expect(target).toBe('/portfolio/marguerite-lucas-new#comments')
    expect(api.get).not.toHaveBeenCalled()
  })

  it('resolves a legacy profile link through the current student portfolios', async () => {
    api.get.mockResolvedValue({
      data: {
        data: [{
          id_etudiant: 'student-1',
          url_publique: 'marguerite-lucas-new',
          est_publie: true,
        }],
      },
    })

    const target = await resolveStudentNotificationTarget({
      type_notification: 'COMMENTAIRE',
      lien_action: '/profil/student-1',
    })

    expect(api.get).toHaveBeenCalledWith('/portfolio/me')
    expect(target).toBe('/portfolio/marguerite-lucas-new#comments')
  })
})
