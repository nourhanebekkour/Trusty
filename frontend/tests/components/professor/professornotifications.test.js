import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ProfessorNotifications from '@/components/professor/ProfessorNotifications.vue'

vi.mock('@/stores/professorStore', () => ({
  useProfessorStore: vi.fn(),
  normaliserProjet:   vi.fn(p => p),
  normaliserStage:    vi.fn(s => s),
  normaliserEtudiant: vi.fn(e => e),
  normaliserNotif:    vi.fn(n => n),
}))

import { useProfessorStore } from '@/stores/professorStore'

let mockMarquerLue

function makeMockStore() {
  mockMarquerLue = vi.fn()
  return {
    projets: [], stages: [], etudiants: [], notifications: [], lettres: [],
    loading: {}, erreur: null, enAttente: 0, valides: 0,
    marquerLue: mockMarquerLue,
    init: vi.fn(),
  }
}

const MOCK_NOTIFICATIONS = [
  { id: 1, nom: 'Alice Dupont', message: 'a soumis un projet PFA',          time: 'il y a 5 min', color: '#66c99f', last: false },
  { id: 2, nom: 'Bob Martin',   message: 'a mis à jour son stage',          time: 'il y a 2h',    color: '#f4b94b', last: false },
  { id: 3, nom: 'Carol Amrani', message: 'a demandé une recommandation',    time: 'il y a 1j',    color: '#6ab0de', last: true  },
]

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  useProfessorStore.mockReturnValue(makeMockStore())
})

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — ProfessorNotifications
// ═══════════════════════════════════════════════════════

describe('ProfessorNotifications.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    const wrapper = mount(ProfessorNotifications, { props: { notifications: MOCK_NOTIFICATIONS } })
    expect(wrapper.exists()).toBe(true)
  })

  it('2 — affiche le titre "Activité récente"', () => {
    const wrapper = mount(ProfessorNotifications, { props: { notifications: MOCK_NOTIFICATIONS } })
    expect(wrapper.find('.card-title').text()).toContain('Activité récente')
  })

  it('3 — affiche autant de .notif-item que de notifications', () => {
    const wrapper = mount(ProfessorNotifications, { props: { notifications: MOCK_NOTIFICATIONS } })
    expect(wrapper.findAll('.notif-item').length).toBe(3)
  })

  it('4 — affiche les noms des utilisateurs', () => {
    const wrapper = mount(ProfessorNotifications, { props: { notifications: MOCK_NOTIFICATIONS } })
    expect(wrapper.text()).toContain('Alice Dupont')
    expect(wrapper.text()).toContain('Bob Martin')
    expect(wrapper.text()).toContain('Carol Amrani')
  })

  it('5 — affiche les messages', () => {
    const wrapper = mount(ProfessorNotifications, { props: { notifications: MOCK_NOTIFICATIONS } })
    expect(wrapper.text()).toContain('a soumis un projet PFA')
    expect(wrapper.text()).toContain('a mis à jour son stage')
  })

  it('6 — affiche les timestamps', () => {
    const wrapper = mount(ProfessorNotifications, { props: { notifications: MOCK_NOTIFICATIONS } })
    expect(wrapper.text()).toContain('il y a 5 min')
    expect(wrapper.text()).toContain('il y a 2h')
  })

  it('7 — la dernière notif a la classe "no-border"', () => {
    const wrapper = mount(ProfessorNotifications, { props: { notifications: MOCK_NOTIFICATIONS } })
    const items = wrapper.findAll('.notif-item')
    expect(items[2].classes()).toContain('no-border')
  })

  it('8 — affiche 0 item si notifications = []', () => {
    const wrapper = mount(ProfessorNotifications, { props: { notifications: [] } })
    expect(wrapper.findAll('.notif-item').length).toBe(0)
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — ProfessorNotifications
// ═══════════════════════════════════════════════════════

describe('ProfessorNotifications.vue — Tests d\'Intégration', () => {

  it('9 — clic sur la 1ère notif appelle store.marquerLue(1)', async () => {
    const wrapper = mount(ProfessorNotifications, { props: { notifications: MOCK_NOTIFICATIONS } })
    await wrapper.findAll('.notif-item')[0].trigger('click')
    expect(mockMarquerLue).toHaveBeenCalledWith(1)
  })

  it('10 — clic sur la 2ème notif appelle store.marquerLue(2)', async () => {
    const wrapper = mount(ProfessorNotifications, { props: { notifications: MOCK_NOTIFICATIONS } })
    await wrapper.findAll('.notif-item')[1].trigger('click')
    expect(mockMarquerLue).toHaveBeenCalledWith(2)
  })

  it('11 — clic sur la 3ème notif appelle store.marquerLue(3)', async () => {
    const wrapper = mount(ProfessorNotifications, { props: { notifications: MOCK_NOTIFICATIONS } })
    await wrapper.findAll('.notif-item')[2].trigger('click')
    expect(mockMarquerLue).toHaveBeenCalledWith(3)
  })

  it('12 — plusieurs clics appellent marquerLue pour chaque id distinct', async () => {
    const wrapper = mount(ProfessorNotifications, { props: { notifications: MOCK_NOTIFICATIONS } })
    await wrapper.findAll('.notif-item')[0].trigger('click')
    await wrapper.findAll('.notif-item')[2].trigger('click')
    expect(mockMarquerLue).toHaveBeenCalledTimes(2)
    expect(mockMarquerLue).toHaveBeenNthCalledWith(1, 1)
    expect(mockMarquerLue).toHaveBeenNthCalledWith(2, 3)
  })
})
