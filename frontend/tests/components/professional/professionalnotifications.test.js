import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ProfessionalNotifications from '@/components/Professional/ProfessionalNotifications.vue'

vi.mock('@/stores/professionalStore', () => ({
  useProfessionalStore: vi.fn(),
}))

import { useProfessionalStore } from '@/stores/professionalStore'

let mockMarquerLue

function makeMockStore() {
  mockMarquerLue = vi.fn()
  return { favoris: [], marquerLue: mockMarquerLue, toggleFavori: vi.fn() }
}

const MOCK_NOTIFICATIONS = [
  { id: 1, nom: 'Alice Dupont',  message: 'a soumis un portfolio',        time: 'il y a 2h',  color: '#66c99f', last: false },
  { id: 2, nom: 'Bob Martin',    message: 'a demandé une recommandation',  time: 'il y a 5h',  color: '#f4b94b', last: false },
  { id: 3, nom: 'Carol Amrani',  message: 'a mis à jour ses compétences',  time: 'il y a 1j',  color: '#6ab0de', last: true  },
]

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  useProfessionalStore.mockReturnValue(makeMockStore())
})

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — ProfessionalNotifications
// ═══════════════════════════════════════════════════════

describe('ProfessionalNotifications.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    const wrapper = mount(ProfessionalNotifications, { props: { notifications: MOCK_NOTIFICATIONS } })
    expect(wrapper.exists()).toBe(true)
  })

  it('2 — affiche le titre "Activité récente"', () => {
    const wrapper = mount(ProfessionalNotifications, { props: { notifications: MOCK_NOTIFICATIONS } })
    expect(wrapper.find('.card-title').text()).toContain('Activité récente')
  })

  it('3 — affiche autant de .notif-item que de notifications', () => {
    const wrapper = mount(ProfessionalNotifications, { props: { notifications: MOCK_NOTIFICATIONS } })
    expect(wrapper.findAll('.notif-item').length).toBe(3)
  })

  it('4 — affiche les noms des utilisateurs', () => {
    const wrapper = mount(ProfessionalNotifications, { props: { notifications: MOCK_NOTIFICATIONS } })
    expect(wrapper.text()).toContain('Alice Dupont')
    expect(wrapper.text()).toContain('Bob Martin')
    expect(wrapper.text()).toContain('Carol Amrani')
  })

  it('5 — affiche les messages des notifications', () => {
    const wrapper = mount(ProfessionalNotifications, { props: { notifications: MOCK_NOTIFICATIONS } })
    expect(wrapper.text()).toContain('a soumis un portfolio')
    expect(wrapper.text()).toContain('a demandé une recommandation')
  })

  it('6 — affiche les timestamps', () => {
    const wrapper = mount(ProfessionalNotifications, { props: { notifications: MOCK_NOTIFICATIONS } })
    expect(wrapper.text()).toContain('il y a 2h')
    expect(wrapper.text()).toContain('il y a 5h')
  })

  it('7 — affiche 0 item si notifications = []', () => {
    const wrapper = mount(ProfessionalNotifications, { props: { notifications: [] } })
    expect(wrapper.findAll('.notif-item').length).toBe(0)
  })

  it('8 — chaque notif a un .notif-dot coloré', () => {
    const wrapper = mount(ProfessionalNotifications, { props: { notifications: MOCK_NOTIFICATIONS } })
    expect(wrapper.findAll('.notif-dot').length).toBe(3)
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — ProfessionalNotifications
// ═══════════════════════════════════════════════════════

describe('ProfessionalNotifications.vue — Tests d\'Intégration', () => {

  it('9 — clic sur la 1ère notif appelle store.marquerLue(1)', async () => {
    const wrapper = mount(ProfessionalNotifications, { props: { notifications: MOCK_NOTIFICATIONS } })
    await wrapper.findAll('.notif-item')[0].trigger('click')
    expect(mockMarquerLue).toHaveBeenCalledWith(1)
  })

  it('10 — clic sur la 2ème notif appelle store.marquerLue(2)', async () => {
    const wrapper = mount(ProfessionalNotifications, { props: { notifications: MOCK_NOTIFICATIONS } })
    await wrapper.findAll('.notif-item')[1].trigger('click')
    expect(mockMarquerLue).toHaveBeenCalledWith(2)
  })

  it('11 — clic sur plusieurs notifs appelle marquerLue pour chacune', async () => {
    const wrapper = mount(ProfessionalNotifications, { props: { notifications: MOCK_NOTIFICATIONS } })
    await wrapper.findAll('.notif-item')[0].trigger('click')
    await wrapper.findAll('.notif-item')[2].trigger('click')
    expect(mockMarquerLue).toHaveBeenCalledTimes(2)
    expect(mockMarquerLue).toHaveBeenNthCalledWith(1, 1)
    expect(mockMarquerLue).toHaveBeenNthCalledWith(2, 3)
  })
})
