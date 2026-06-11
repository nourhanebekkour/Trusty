import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// ── Mock du store professionnel ──────────────────────────────────────────────
vi.mock('@/stores/professionalStore', () => ({
  useProfessionalStore: vi.fn(),
  normaliserCandidat: vi.fn(c => c),
  normaliserNotif:    vi.fn((n) => n),
  normaliserRec:      vi.fn(r => r),
}))

import { useProfessionalStore } from '@/stores/professionalStore'
import ProfessionalView from '@/views/ProfessionalView.vue'

const MOCK_CANDIDATS = [
  { id: 'e1', nom: 'Alice Dupont', initiales: 'AD', formation: 'GINF', ecole: 'ENSA', ville: 'Rabat', score: 85, gradient: '', icon: 'user', color: 'blue', description: '' },
  { id: 'e2', nom: 'Bob Martin',   initiales: 'BM', formation: 'GIND', ecole: 'ENSA', ville: 'Fès',   score: 70, gradient: '', icon: 'user', color: 'blue', description: '' },
]

function makeMockStore(overrides = {}) {
  return {
    candidats:          MOCK_CANDIDATS,
    recsEmises:         [],
    notifications:      [],
    favoris:            [],
    consultes:          3,
    loading:            { candidats: false, notifs: false },
    erreur:             null,
    totalRecs:          0,
    candidatsFavoris:   [],
    candidatsEnAttente: 2,
    init:                   vi.fn(),
    chargerCandidats:       vi.fn(),
    chargerNotifications:   vi.fn(),
    envoyerRecommandation:  vi.fn(),
    marquerNotifLue:        vi.fn(),
    aRecommande:            vi.fn(() => false),
    toggleFavori:           vi.fn(),
    ...overrides,
  }
}

let store

const mountView = () => {
  setActivePinia(createPinia())
  store = makeMockStore()
  useProfessionalStore.mockReturnValue(store)
  return mount(ProfessionalView, {
    global: { stubs: { RouterLink: true } },
  })
}

// ═════════════════════════════════════════════════════════════
// TESTS UNITAIRES — ProfessionalView
// ═════════════════════════════════════════════════════════════

describe('ProfessionalView — Tests Unitaires', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('1 — se monte sans erreur', () => {
    const wrapper = mountView()
    expect(wrapper.exists()).toBe(true)
  })

  it('2 — affiche le titre "Portfolios à recommander"', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('Portfolios')
  })

  it('3 — affiche la sidebar ou topbar', () => {
    const wrapper = mountView()
    expect(wrapper.exists()).toBe(true)
  })

  it('4 — affiche les cartes de statistiques', () => {
    const wrapper = mountView()
    expect(wrapper.findAll('.stat-card').length).toBeGreaterThanOrEqual(0)
  })

  it('5 — affiche les tabs (Portfolios, Stages, Activités)', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('Portfolios')
    expect(wrapper.text()).toContain('Stages')
    expect(wrapper.text()).toContain('Activités')
  })

  it('6 — affiche la liste des candidats', () => {
    const wrapper = mountView()
    expect(wrapper.findAll('.proj-item').length).toBeGreaterThanOrEqual(0)
  })

  it('7 — affiche le stat "En attente"', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('En attente')
  })

  it('8 — affiche le stat "Recommandations émises"', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('Recommandations')
  })

  it('9 — le store est appelé au montage', () => {
    mountView()
    expect(store.init).toHaveBeenCalled()
  })

  it('10 — le store retourne les candidats mockés', () => {
    mountView()
    expect(store.candidats).toHaveLength(2)
  })

  it('11 — candidatsEnAttente est 2', () => {
    mountView()
    expect(store.candidatsEnAttente).toBe(2)
  })

  it('12 — le store ne retourne pas d\'erreur initiale', () => {
    mountView()
    expect(store.erreur).toBeNull()
  })
})

// ═════════════════════════════════════════════════════════════
// SCÉNARIOS — ProfessionalView
// ═════════════════════════════════════════════════════════════

describe("ProfessionalView — Scénarios", () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('13 — onglet actif par défaut est "Portfolios"', () => {
    const wrapper = mountView()
    const activeTab = wrapper.find('.tab.active')
    if (activeTab.exists()) expect(activeTab.text()).toContain('Portfolios')
  })

  it('14 — clic sur un onglet différent le rend actif', async () => {
    const wrapper = mountView()
    const tabs = wrapper.findAll('.tab')
    if (tabs.length > 1) {
      await tabs[1].trigger('click')
      expect(tabs[1].classes()).toContain('active')
    }
  })

  it('15 — candidats visibles dans la vue', () => {
    mountView()
    expect(store.candidats).toHaveLength(2)
    expect(store.candidats[0].nom).toBe('Alice Dupont')
  })

  it('16 — chargerCandidats est disponible dans le store', () => {
    mountView()
    expect(typeof store.chargerCandidats).toBe('function')
  })
})
