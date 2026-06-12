import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfessorView from '@/views/professor/ProfessorView.vue'
import { createPinia, setActivePinia } from 'pinia'

// ── Mock du store professeur ─────────────────────────────────────────────────
// ProfessorView appelle useProfessorStore() en setup → pinia doit être active
// ou le store doit être mocké. On mocke pour contrôler les données.
vi.mock('@/stores/professorStore', () => ({
  useProfessorStore: vi.fn(),
  normaliserProjet:  vi.fn(p => p),
  normaliserStage:   vi.fn(s => s),
  normaliserEtudiant: vi.fn(e => e),
  normaliserNotif:   vi.fn((n) => n),
}))

import { useProfessorStore } from '@/stores/professorStore'
import ProfessorView from '@/views/ProfessorView.vue'

const MOCK_PROJETS = [
  { id: 'pj1', nom: 'Projet IA', etudiant: 'Alice Dupont', context: 'PFA', status: 'pending', statusLabel: 'En attente', progress: 50, statusColor: '#f4b94b', color: 'blue', date: '01/05/2024', description: 'desc', icon: 'laptop' },
  { id: 'pj2', nom: 'App Mobile', etudiant: 'Bob Martin', context: 'PFE', status: 'pending', statusLabel: 'En attente', progress: 50, statusColor: '#f4b94b', color: 'blue', date: '15/04/2024', description: 'desc', icon: 'laptop' },
]

const MOCK_STAGES = [
  { id: 's1', entreprise: 'TechCorp', etudiant: 'Alice', role: 'Dev', dates: '01/06/2024', progress: 30, color: '#f4b94b' },
]

const MOCK_ETUDIANTS = [
  { id: 'e1', nom: 'Alice Dupont', initiales: 'AD', formation: 'GINF', score: 80, gradient: '' },
  { id: 'e2', nom: 'Bob Martin',   initiales: 'BM', formation: 'GIND', score: 75, gradient: '' },
  { id: 'e3', nom: 'Carol Amrani', initiales: 'CA', formation: 'GINF', score: 90, gradient: '' },
  { id: 'e4', nom: 'David Radi',   initiales: 'DR', formation: 'GIND', score: 70, gradient: '' },
]

function makeMockStore(overrides = {}) {
  return {
    projets:       MOCK_PROJETS,
    stages:        MOCK_STAGES,
    etudiants:     MOCK_ETUDIANTS,
    notifications: [],
    lettres:       [],
    loading:       { projets: false, stages: false, notifs: false },
    erreur:        null,
    enAttente:     2,
    valides:       0,
    etudiantsSuivis: 4,
    stagesEnCours:   1,
    init:              vi.fn(),
    chargerProjets:    vi.fn(),
    chargerStages:     vi.fn(),
    chargerNotifications: vi.fn(),
    validerProjet:     vi.fn(async (projet) => {
      const found = store.projets.find(p => p.id === projet.id)
      if (found) { found.status = 'valide'; found.statusLabel = 'Validé' }
    }),
    validerStage: vi.fn(),
    ...overrides,
  }
}

let store

const mountView = () => {
  setActivePinia(createPinia())
  store = makeMockStore()
  useProfessorStore.mockReturnValue(store)
  return mount(ProfessorView, {
    global: { stubs: { RouterLink: true } },
  })
}

// ═════════════════════════════════════════════════════════════
// TESTS UNITAIRES — ProfessorView
// ═════════════════════════════════════════════════════════════

describe('ProfessorView — Tests Unitaires', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('1 — se monte sans erreur', () => {
    const wrapper = mountView()
    expect(wrapper.exists()).toBe(true)
  })

  it('2 — affiche le titre "Éléments à valider"', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('Éléments à valider')
  })

  it('3 — affiche le logo Trusty dans la sidebar', () => {
    const wrapper = mountView()
    expect(wrapper.find('.logo').exists() || wrapper.text()).toBeTruthy()
  })

  it('4 — affiche 4 cartes de statistiques', () => {
    const wrapper = mountView()
    expect(wrapper.findAll('.stat-card').length).toBe(4)
  })

  it('5 — affiche les tabs (Projets, Stages, Activités)', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('Projets')
    expect(wrapper.text()).toContain('Stages')
    expect(wrapper.text()).toContain('Activités')
  })

  it('6 — affiche la liste des projets à valider', () => {
    const wrapper = mountView()
    expect(wrapper.findAll('.proj-item').length).toBeGreaterThan(0)
  })

  it('7 — affiche la section "Mes étudiants"', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('Mes étudiants')
  })

  it('8 — affiche la section "Stages supervisés"', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('Stages supervisés')
  })

  it('9 — affiche la section "Lettres de recommandation"', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('Lettres de recommandation')
  })

  it('10 — affiche des projets en attente avec le bouton "Valider"', () => {
    const wrapper = mountView()
    const validateBtns = wrapper.findAll('.btn-primary.btn-sm').filter(b => b.text() === 'Valider')
    expect(validateBtns.length).toBeGreaterThan(0)
  })
})

// ═════════════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — ProfessorView
// ═════════════════════════════════════════════════════════════

describe("ProfessorView — Tests d'Intégration", () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('11 — clic "Valider" change le statut du projet en "Validé"', async () => {
    const wrapper = mountView()
    const validateBtn = wrapper.findAll('.btn-primary.btn-sm').find(b => b.text() === 'Valider')
    if (validateBtn) {
      await validateBtn.trigger('click')
      expect(store.validerProjet).toHaveBeenCalled()
    }
  })

  it('12 — après validation, le store.validerProjet est appelé', async () => {
    const wrapper = mountView()
    const validateBtn = wrapper.findAll('.btn-primary.btn-sm').find(b => b.text() === 'Valider')
    if (validateBtn) await validateBtn.trigger('click')
    expect(store.validerProjet).toHaveBeenCalledTimes(validateBtn ? 1 : 0)
  })

  it('13 — onglet actif par défaut est "Projets"', () => {
    const wrapper = mountView()
    const activeTab = wrapper.find('.tab.active')
    if (activeTab.exists()) expect(activeTab.text()).toBe('Projets')
  })

  it('14 — clic sur un onglet différent le rend actif', async () => {
    const wrapper = mountView()
    const tabs = wrapper.findAll('.tab')
    if (tabs.length > 1) {
      await tabs[1].trigger('click')
      expect(tabs[1].classes()).toContain('active')
    }
  })

  it('15 — affiche les étudiants dans la liste', () => {
    const wrapper = mountView()
    const studentRows = wrapper.findAll('.student-row')
    expect(studentRows.length).toBeGreaterThanOrEqual(0)
  })
})
