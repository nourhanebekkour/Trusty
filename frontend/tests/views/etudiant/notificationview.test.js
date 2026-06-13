import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import NotificationView from '@/views/Etudiant/Notification.vue'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  getStudentNotifications: vi.fn(),
  markStudentNotificationAsRead: vi.fn(),
  resolveStudentNotificationTarget: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mocks.push }),
}))

vi.mock('@/services/studentNotificationService', () => ({
  getStudentNotifications: mocks.getStudentNotifications,
  markAllStudentNotificationsAsRead: vi.fn(),
  markStudentNotificationAsRead: mocks.markStudentNotificationAsRead,
  resolveStudentNotificationTarget: mocks.resolveStudentNotificationTarget,
}))

vi.mock('@/stores/authstore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id_utilisateur: 'u1' },
    fetchUser: vi.fn(),
    isAdmin: false,
  })),
}))

describe('NotificationView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mocks.getStudentNotifications.mockResolvedValue([])
  })

  it('reloads notifications from the service', async () => {
    const wrapper = mount(NotificationView)

    await vi.waitFor(() => expect(mocks.getStudentNotifications).toHaveBeenCalledTimes(1))
    expect(wrapper.exists()).toBe(true)
  })

  it('displays a notification and its unread count after reload', async () => {
    mocks.getStudentNotifications.mockResolvedValue([
      {
        id_notification: 'notification-1',
        titre: 'Nouveau commentaire',
        message: 'Un commentaire a ete ajoute',
        type_notification: 'COMMENTAIRE',
        est_lue: false,
        date_creation: new Date().toISOString(),
      },
    ])

    const wrapper = mount(NotificationView)

    await vi.waitFor(() => expect(wrapper.text()).toContain('Nouveau commentaire'))
    expect(wrapper.findAll('.stat-value')[1].text()).toBe('1')
  })

  it('opens the resolved portfolio in read-only mode', async () => {
    mocks.getStudentNotifications.mockResolvedValue([
      {
        id_notification: 'notification-1',
        titre: 'Nouveau commentaire',
        message: 'Un commentaire a ete ajoute',
        type_notification: 'COMMENTAIRE',
        est_lue: false,
        date_creation: new Date().toISOString(),
        lien_action: '/profil/student-1',
      },
    ])
    mocks.resolveStudentNotificationTarget.mockResolvedValue('/portfolio/marguerite-lucas-new#comments')

    const wrapper = mount(NotificationView)
    await vi.waitFor(() => expect(wrapper.find('.notif-card').exists()).toBe(true))
    await wrapper.find('.notif-card').trigger('click')

    await vi.waitFor(() =>
      expect(mocks.push).toHaveBeenCalledWith('/portfolio/marguerite-lucas-new#comments')
    )
    expect(mocks.markStudentNotificationAsRead).toHaveBeenCalledWith('notification-1')
  })
})
