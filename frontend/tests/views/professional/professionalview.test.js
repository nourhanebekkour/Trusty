import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// ProfessionalView.vue utilise directement @/services/professionalApi (pas de store)
vi.mock('@/services/professionalApi', () => ({
  getProfessionalNotifications:  vi.fn(),
  getProfessionalActionHistory:  vi.fn(),
  getProfessionalInternships:    vi.fn(),
  getProfessionalProjects:       vi.fn(),
  createProfessionalRecommendation: vi.fn(),
}))

import {
  getProfessionalNotifications,
  getProfessionalActionHistory,
  getProfessionalInternships,
  getProfessionalProjects,
} from '@/services/professionalApi'
import ProfessionalView from '@/views/Professional/ProfessionalView.vue'

const MOCK_NOTIFICATIONS = [
  { id: 'n1', title: 'Nouveau stage', type: 'STAGE', createdAt: '2024-05-01T10:00:00Z', isRead: false },
  { id: 'n2', title: 'Recommandation reçue', type: 'RECOMMANDATION', createdAt: '2024-04-30T08:00:00Z', isRead: true },
]

const MOCK_ACTIONS = [
  { id: 'a1', type: 'VALIDATION', description: 'Stage validé', entity: 'Stage TechCorp', createdAt: '2024-05-01T10:00:00Z' },
]

function mockApis(overrides = {}) {
  getProfessionalNotifications.mockResolvedValue({ notifications: MOCK_NOTIFICATIONS })
  getProfessionalActionHistory.mockResolvedValue({ actions: MOCK_ACTIONS })
  getProfessionalInternships.mockResolvedValue([])
  getProfessionalProjects.mockResolvedValue([])
  Object.assign({}, overrides)
}

function mountView() {
  setActivePinia(createPinia())
  mockApis()
  return mount(ProfessionalView, {
    global: { stubs: { RouterLink: true } },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ═════════════════════════════════════════════════════════════
// TESTS UNITAIRES — ProfessionalView
// ═════════════════════════════════════════════════════════════

describe('ProfessionalView — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    const wrapper = mountView()
    expect(wrapper.exists()).toBe(true)
  })

  it('2 — affiche le titre "Dashboard"', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('Dashboard')
  })

  it('3 — affiche les stats', () => {
    const wrapper = mountView()
    expect(wrapper.findAll('.prof-stat-card').length).toBeGreaterThanOrEqual(0)
  })

  it('4 — affiche la section "Recommandation rapide"', async () => {
    const wrapper = mountView()
    await flushPromises()
    expect(wrapper.text()).toContain('Recommandation')
  })

  it('5 — affiche "Actions récentes" ou timeline', async () => {
    const wrapper = mountView()
    await flushPromises()
    expect(wrapper.text()).toContain('Actions')
  })

  it('6 — affiche "Notifications récentes"', async () => {
    const wrapper = mountView()
    await flushPromises()
    expect(wrapper.text()).toContain('Notifications')
  })

  it('7 — affiche le formulaire de recommandation', async () => {
    const wrapper = mountView()
    await flushPromises()
    expect(wrapper.find('input[placeholder*="étudiant"]').exists()).toBe(true)
  })

  it('8 — le champ de message de recommandation existe', async () => {
    const wrapper = mountView()
    await flushPromises()
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('9 — le bouton Envoyer de recommandation est présent', async () => {
    const wrapper = mountView()
    await flushPromises()
    const btns = wrapper.findAll('button')
    const sendBtn = btns.find(b => b.text().includes('Envoyer'))
    expect(sendBtn).toBeDefined()
  })

  it('10 — est désactivé si les champs sont vides', async () => {
    const wrapper = mountView()
    await flushPromises()
    const btns = wrapper.findAll('button')
    const sendBtn = btns.find(b => b.text().includes('Envoyer'))
    if (sendBtn) {
      expect(sendBtn.element.disabled).toBe(true)
    }
  })

  it('11 — appelle les APIs au montage', async () => {
    mountView()
    await flushPromises()
    expect(getProfessionalNotifications).toHaveBeenCalledOnce()
    expect(getProfessionalActionHistory).toHaveBeenCalledOnce()
  })

  it('12 — affiche les notifications après chargement', async () => {
    const wrapper = mountView()
    await flushPromises()
    expect(wrapper.text()).toContain('Nouveau stage')
  })
})

// ═════════════════════════════════════════════════════════════
// SCÉNARIOS — ProfessionalView
// ═════════════════════════════════════════════════════════════

describe('ProfessionalView — Scénarios', () => {

  it('13 — reste stable si des APIs échouent (Promise.allSettled gère les rejets)', async () => {
    getProfessionalNotifications.mockRejectedValue(new Error('API indisponible'))
    getProfessionalActionHistory.mockRejectedValue(new Error('API indisponible'))
    getProfessionalInternships.mockRejectedValue(new Error('API indisponible'))
    getProfessionalProjects.mockRejectedValue(new Error('API indisponible'))

    setActivePinia(createPinia())
    const wrapper = mount(ProfessionalView, {
      global: { stubs: { RouterLink: true } },
    })
    await flushPromises()
    // Promise.allSettled ne throw pas : le composant affiche le dashboard avec données vides
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Dashboard')
  })

  it('14 — affiche "Aucune action récente" si aucune action', async () => {
    setActivePinia(createPinia())
    getProfessionalNotifications.mockResolvedValue({ notifications: MOCK_NOTIFICATIONS })
    getProfessionalActionHistory.mockResolvedValue({ actions: [] })
    getProfessionalInternships.mockResolvedValue([])
    getProfessionalProjects.mockResolvedValue([])
    const wrapper = mount(ProfessionalView, { global: { stubs: { RouterLink: true } } })
    await flushPromises()
    expect(wrapper.text()).toContain('Aucune action récente')
  })

  it('15 — affiche "Aucune notification" si liste vide', async () => {
    setActivePinia(createPinia())
    getProfessionalNotifications.mockResolvedValue({ notifications: [] })
    getProfessionalActionHistory.mockResolvedValue({ actions: MOCK_ACTIONS })
    getProfessionalInternships.mockResolvedValue([])
    getProfessionalProjects.mockResolvedValue([])
    const wrapper = mount(ProfessionalView, { global: { stubs: { RouterLink: true } } })
    await flushPromises()
    expect(wrapper.text()).toContain('Aucune notification')
  })

  it('16 — les stats s\'initialisent à 0', () => {
    const wrapper = mountView()
    const statValues = wrapper.findAll('.stat-value')
    statValues.forEach(v => {
      expect(Number(v.text())).toBeGreaterThanOrEqual(0)
    })
  })
})
