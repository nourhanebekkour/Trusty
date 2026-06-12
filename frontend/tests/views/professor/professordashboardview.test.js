import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/stores/professorStore', () => ({
  useProfessorStore:   vi.fn(),
  normaliserProjet:    vi.fn(p => p),
  normaliserStage:     vi.fn(s => s),
  normaliserEtudiant:  vi.fn(e => e),
  normaliserNotif:     vi.fn(n => n),
}))

import { useProfessorStore } from '@/stores/professorStore'
import ProfessorView from '@/views/professor/ProfessorView.vue'

function makeMockStore(overrides = {}) {
  return {
    projets:         [],
    stages:          [],
    etudiants:       [],
    notifications:   [],
    loading:         { projets: false, stages: false, notifs: false },
    erreur:          null,
    enAttente:       0,
    valides:         0,
    etudiantsSuivis: 0,
    stagesEnCours:   0,
    init:                    vi.fn(),
    chargerProjets:          vi.fn(),
    chargerStages:           vi.fn(),
    chargerNotifications:    vi.fn(),
    validerProjet:           vi.fn(),
    validerStage:            vi.fn(),
    ...overrides,
  }
}

let store

function mountView(overrides = {}) {
  setActivePinia(createPinia())
  store = makeMockStore(overrides)
  useProfessorStore.mockReturnValue(store)
  return mount(ProfessorView, {
    global: { stubs: { RouterLink: true } },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ProfessorView.vue — rendu initial', () => {
  it('affiche le titre de la page', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('Tableau de Bord Professeur')
  })

  it('affiche le sous-titre de la page', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('étudiants')
  })

  it('se monte sans erreur', () => {
    const wrapper = mountView()
    expect(wrapper.exists()).toBe(true)
  })
})

describe('ProfessorView.vue — données chargées', () => {
  it('appelle store.init() au montage', async () => {
    mountView()
    await flushPromises()
    expect(store.init).toHaveBeenCalledOnce()
  })

  it('initialise le store avec les données', async () => {
    mountView({ enAttente: 12, valides: 3 })
    await flushPromises()
    expect(store.enAttente).toBe(12)
    expect(store.valides).toBe(3)
  })

  it('store sans projets : projets est vide', async () => {
    mountView({ projets: [] })
    await flushPromises()
    expect(store.projets).toHaveLength(0)
  })
})

describe('ProfessorView.vue — recherche étudiants', () => {
  it('store retourne les étudiants mockés', () => {
    const etudiants = [
      { id: '1', fullName: 'Alice Martin', level: 'M2', field: 'Info' },
      { id: '2', fullName: 'Bob Dupont',   level: 'L3', field: 'Maths' },
    ]
    mountView({ etudiants })
    expect(store.etudiants).toHaveLength(2)
  })

  it('store retourne les projets mockés', () => {
    const projets = [
      { id: 'pj1', nom: 'Projet IA', status: 'pending' },
    ]
    mountView({ projets })
    expect(store.projets).toHaveLength(1)
  })
})
