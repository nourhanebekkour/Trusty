import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AppTopbar from '@/components/layout/AppTopbar.vue'

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/services/api', () => ({
  default: {
    get:   vi.fn(),
    patch: vi.fn(),
  },
}))

vi.mock('@/stores/authstore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { prenom: 'Ali', nom: 'Ben', role: 'ETUDIANT' },
    fetchProfile: vi.fn(),
  })),
}))

import api from '@/services/api'
import { useAuthStore } from '@/stores/authstore'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeNotifications(count = 2, unread = true) {
  return Array.from({ length: count }, (_, i) => ({
    id_notification: i + 1,
    titre:           `Notif ${i + 1}`,
    message:         `Message ${i + 1}`,
    est_lue:         !unread,
    date_creation:   new Date(Date.now() - i * 3600000).toISOString(),
    type_notification: 'INFO',
  }))
}

function mountTopbar(propsData = {}) {
  return mount(AppTopbar, {
    props: propsData,
    global: { stubs: { RouterLink: true } },
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AppTopbar.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    api.get.mockResolvedValue({ data: [] })
    api.patch.mockResolvedValue({})
  })

  // ── Identité utilisateur ──────────────────────────────────────────────────

  describe('Informations utilisateur', () => {
    it('affiche le nom complet de l\'utilisateur', async () => {
      const wrapper = mountTopbar()
      await flushPromises()
      expect(wrapper.find('.topbar__user-name').text()).toBe('Ali Ben')
    })

    it('affiche les initiales dans l\'avatar', async () => {
      const wrapper = mountTopbar()
      await flushPromises()
      expect(wrapper.find('.topbar__avatar').text()).toBe('AB')
    })

    it('affiche le rôle formaté', async () => {
      const wrapper = mountTopbar()
      await flushPromises()
      expect(wrapper.find('.topbar__user-role').text()).toBe('Étudiant')
    })

    it('affiche "Utilisateur" quand prenom et nom sont absents', async () => {
      useAuthStore.mockReturnValue({
        user: { prenom: '', nom: '', role: 'ETUDIANT' },
        fetchProfile: vi.fn(),
      })
      const wrapper = mountTopbar()
      await flushPromises()
      expect(wrapper.find('.topbar__user-name').text()).toBe('Utilisateur')
    })

    it('affiche "Chargement…" quand user est null', async () => {
      useAuthStore.mockReturnValue({ user: null, fetchProfile: vi.fn() })
      const wrapper = mountTopbar()
      // fetchProfile est appelée donc on attend
      await flushPromises()
      // après fetchProfile, user reste null dans ce mock
      expect(wrapper.find('.topbar__user-name').text()).toBe('Chargement...')
    })
  })

  // ── Badge public ──────────────────────────────────────────────────────────

  describe('Badge public', () => {
    it("n'affiche pas le badge par défaut", async () => {
      const wrapper = mountTopbar()
      await flushPromises()
      expect(wrapper.find('.topbar__public').exists()).toBe(false)
    })

    it('affiche le badge quand showPublicBadge est true', async () => {
      const wrapper = mountTopbar({ showPublicBadge: true })
      await flushPromises()
      expect(wrapper.find('.topbar__public').exists()).toBe(true)
    })
  })

  // ── Notifications ─────────────────────────────────────────────────────────

  describe('Notifications', () => {
    it('affiche le point rouge avec le nombre de non-lues', async () => {
      api.get.mockResolvedValue({ data: makeNotifications(3, true) })
      const wrapper = mountTopbar()
      await flushPromises()
      expect(wrapper.find('.topbar__notif-dot').exists()).toBe(true)
      expect(wrapper.find('.topbar__notif-dot').text()).toBe('3')
    })

    it("n'affiche pas le point rouge quand tout est lu", async () => {
      api.get.mockResolvedValue({ data: makeNotifications(3, false) })
      const wrapper = mountTopbar()
      await flushPromises()
      expect(wrapper.find('.topbar__notif-dot').exists()).toBe(false)
    })

    it('affiche "9+" quand il y a plus de 9 non-lues', async () => {
      api.get.mockResolvedValue({ data: makeNotifications(12, true) })
      const wrapper = mountTopbar()
      await flushPromises()
      expect(wrapper.find('.topbar__notif-dot').text()).toBe('9+')
    })

    it('ouvre le panel en cliquant sur la cloche', async () => {
      const wrapper = mountTopbar()
      await flushPromises()
      await wrapper.find('.topbar__bell').trigger('click')
      expect(wrapper.find('.notif-panel').exists()).toBe(true)
    })

    it('affiche "Aucune notification" quand la liste est vide', async () => {
      api.get.mockResolvedValue({ data: [] })
      const wrapper = mountTopbar()
      await flushPromises()
      await wrapper.find('.topbar__bell').trigger('click')
      await flushPromises()
      expect(wrapper.find('.notif-panel__state').text()).toBe('Aucune notification')
    })

    it('liste les notifications reçues', async () => {
      api.get.mockResolvedValue({ data: makeNotifications(2) })
      const wrapper = mountTopbar()
      await flushPromises()
      await wrapper.find('.topbar__bell').trigger('click')
      await flushPromises()
      const items = wrapper.findAll('.notif-item')
      expect(items.length).toBe(2)
    })

    it('applique notif-item--unread pour une notif non lue', async () => {
      api.get.mockResolvedValue({ data: makeNotifications(1, true) })
      const wrapper = mountTopbar()
      await flushPromises()
      await wrapper.find('.topbar__bell').trigger('click')
      await flushPromises()
      expect(wrapper.find('.notif-item').classes()).toContain('notif-item--unread')
    })

    it('ferme le panel en cliquant sur l\'overlay', async () => {
      const wrapper = mountTopbar()
      await flushPromises()
      await wrapper.find('.topbar__bell').trigger('click')
      expect(wrapper.find('.notif-panel').exists()).toBe(true)
      await wrapper.find('.notif-overlay').trigger('click')
      expect(wrapper.find('.notif-panel').exists()).toBe(false)
    })

    it('marque toutes les notifications comme lues', async () => {
      api.get.mockResolvedValue({ data: makeNotifications(2, true) })
      const wrapper = mountTopbar()
      await flushPromises()
      await wrapper.find('.topbar__bell').trigger('click')
      await flushPromises()
      await wrapper.find('.notif-panel__mark-all').trigger('click')
      expect(api.patch).toHaveBeenCalledWith('/notifications/read-all')
      // Le compteur doit retomber à 0
      expect(wrapper.find('.topbar__notif-dot').exists()).toBe(false)
    })

    it('accepte res.data.data (enveloppe sendResponse)', async () => {
      const notifs = makeNotifications(2)
      api.get.mockResolvedValue({ data: { data: notifs } })
      const wrapper = mountTopbar()
      await flushPromises()
      await wrapper.find('.topbar__bell').trigger('click')
      await flushPromises()
      expect(wrapper.findAll('.notif-item').length).toBe(2)
    })
  })

  // ── formatRelativeDate ────────────────────────────────────────────────────

  describe('Formatage des dates relatives', () => {
    const cases = [
      { label: 'À l\'instant',   offset: 30_000 },           // < 1h
      { label: 'Il y a 2h',      offset: 2 * 3_600_000 },    // 2h
      { label: 'Hier',           offset: 86_400_000 },        // 1 jour
      { label: 'Il y a 3 jours', offset: 3 * 86_400_000 },   // 3 jours
    ]

    cases.forEach(({ label, offset }) => {
      it(`affiche "${label}" correctement`, async () => {
        const notif = [{
          id_notification: 1,
          titre: 'Test',
          message: 'Msg',
          est_lue: false,
          date_creation: new Date(Date.now() - offset).toISOString(),
        }]
        api.get.mockResolvedValue({ data: notif })
        const wrapper = mountTopbar()
        await flushPromises()
        await wrapper.find('.topbar__bell').trigger('click')
        await flushPromises()
        expect(wrapper.find('.notif-item__time').text()).toBe(label)
      })
    })
  })
})