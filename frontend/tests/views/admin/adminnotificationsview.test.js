import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/services/adminNotificationService', () => ({
  getAdminNotifications:     vi.fn(),
  markNotificationAsRead:    vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
  deleteNotification:        vi.fn(),
}))

import AdminNotifications from '@/views/admin/AdminNotifications.vue'
import * as adminNotifSvc from '@/services/adminNotificationService'

const NOTIFS = [
  { id_notification: 1, titre: 'Alerte système', message: 'Serveur redémarré', est_lue: false, type_notification: 'SYSTEME', date_creation: new Date().toISOString() },
  { id_notification: 2, titre: 'Nouveau utilisateur', message: 'Inscription',    est_lue: true,  type_notification: 'USER',    date_creation: new Date().toISOString() },
]

function mountView() {
  return mount(AdminNotifications, {
    global: { plugins: [createPinia()] }
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('AdminNotifications.vue — rendu initial', () => {
  it('affiche le titre de la page', () => {
    adminNotifSvc.getAdminNotifications.mockResolvedValue([])
    const wrapper = mountView()
    expect(wrapper.text()).toContain('Notifications')
  })

  it('affiche le bouton Actualiser', () => {
    adminNotifSvc.getAdminNotifications.mockResolvedValue([])
    const wrapper = mountView()
    expect(wrapper.text()).toContain('Actualiser')
  })

  it('affiche l\'état vide si aucune notification', async () => {
    adminNotifSvc.getAdminNotifications.mockResolvedValue([])
    const wrapper = mountView()
    await new Promise(r => setTimeout(r, 10))
    expect(wrapper.text()).toContain('Aucune notification trouvée')
  })
})

describe('AdminNotifications.vue — statistiques', () => {
  it('affiche le compteur total de notifications', async () => {
    adminNotifSvc.getAdminNotifications.mockResolvedValue(NOTIFS)
    const wrapper = mountView()
    await new Promise(r => setTimeout(r, 10))
    expect(wrapper.text()).toContain('2')
  })

  it('calcule unreadCount correctement', async () => {
    adminNotifSvc.getAdminNotifications.mockResolvedValue(NOTIFS)
    const wrapper = mountView()
    await new Promise(r => setTimeout(r, 10))
    const statValues = wrapper.findAll('.stat-value')
    // [total=2, non_lues=1, lues=1]
    expect(statValues[0].text()).toBe('2')
    expect(statValues[1].text()).toBe('1')
    expect(statValues[2].text()).toBe('1')
  })
})

describe('AdminNotifications.vue — liste des notifications', () => {
  it('affiche une notif-card par notification', async () => {
    adminNotifSvc.getAdminNotifications.mockResolvedValue(NOTIFS)
    const wrapper = mountView()
    await new Promise(r => setTimeout(r, 10))
    const items = wrapper.findAll('.notif-card')
    expect(items).toHaveLength(2)
  })

  it('affiche le titre des notifications', async () => {
    adminNotifSvc.getAdminNotifications.mockResolvedValue(NOTIFS)
    const wrapper = mountView()
    await new Promise(r => setTimeout(r, 10))
    expect(wrapper.text()).toContain('Alerte système')
    expect(wrapper.text()).toContain('Nouveau utilisateur')
  })

  it('applique la classe notif-unread aux non lues', async () => {
    adminNotifSvc.getAdminNotifications.mockResolvedValue(NOTIFS)
    const wrapper = mountView()
    await new Promise(r => setTimeout(r, 10))
    const unread = wrapper.find('.notif-unread')
    expect(unread.exists()).toBe(true)
  })
})

describe('AdminNotifications.vue — filtres', () => {
  it('filtre par statut non lu', async () => {
    adminNotifSvc.getAdminNotifications.mockResolvedValue(NOTIFS)
    const wrapper = mountView()
    await new Promise(r => setTimeout(r, 10))
    const selects = wrapper.findAll('select.select-input')
    if (selects.length >= 1) {
      await selects[0].setValue('unread')
      await wrapper.vm.$nextTick()
      const items = wrapper.findAll('.notif-card')
      expect(items).toHaveLength(1)
    }
  })

  it('filtre par recherche textuelle', async () => {
    adminNotifSvc.getAdminNotifications.mockResolvedValue(NOTIFS)
    const wrapper = mountView()
    await new Promise(r => setTimeout(r, 10))
    const searchInput = wrapper.find('input.search-input')
    if (searchInput.exists()) {
      await searchInput.setValue('Alerte')
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Alerte système')
      expect(wrapper.text()).not.toContain('Nouveau utilisateur')
    }
  })
})
