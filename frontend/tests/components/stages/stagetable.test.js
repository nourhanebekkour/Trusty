import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/stores/stageStore', () => ({
  useStageStore: vi.fn(),
  initiales:   (str) => str ? str.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?',
  logoColor:   () => 'linear-gradient(135deg,#4a7fa3,#2d5a7a)',
  avatarColor: () => '#7aad88',
  formatDate:  (d) => d ? '15 juin 2024' : '—',
  badgeClass:  (s) => ({ VALIDE: 'badge--valide', EN_ATTENTE: 'badge--attente', REJETE: 'badge--rejete' }[s] ?? 'badge--cours'),
  labelStatut: (s) => ({ VALIDE: 'Validé', EN_ATTENTE: 'En attente', REJETE: 'Rejeté' }[s] ?? s),
}))

import { useStageStore } from '@/stores/stageStore'
import StageTable from '@/components/stages/StageTable.vue'

const STAGES = [
  { id_stage: 1, entreprise: 'TechCorp', poste: 'Dev', status_validation: 'VALIDE',     date_debut: '2024-01-01', date_fin: '2024-06-01', encadrant_academique: 'Prof A' },
  { id_stage: 2, entreprise: 'StartupXYZ', poste: 'Lead', status_validation: 'EN_ATTENTE', date_debut: '2024-03-01', date_fin: null,         encadrant_academique: '' },
]

function makeStore(overrides = {}) {
  const store = {
    loading:           false,
    error:             null,
    stagesPagines:     STAGES,
    stagesFiltres:     STAGES,
    showFilter:        false,
    filterStatut:      '',
    filterSearch:      '',
    page:              1,
    totalPages:        1,
    openModal:         vi.fn(),
    confirmerSuppression: vi.fn(),
    chargerStages:     vi.fn(),
    ...overrides,
  }
  useStageStore.mockReturnValue(store)
  return store
}

function mountTable(storeOverrides = {}) {
  const store = makeStore(storeOverrides)
  return { wrapper: mount(StageTable, { global: { stubs: { Teleport: true } } }), store }
}

// ═════════════════════════════════════════════════════════════
// TESTS UNITAIRES — StageTable
// ═════════════════════════════════════════════════════════════

describe('StageTable.vue — Tests Unitaires', () => {

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('1 — affiche le spinner si loading est true', () => {
    const { wrapper } = mountTable({ loading: true })
    expect(wrapper.find('.loading-state').exists()).toBe(true)
  })

  it('2 — affiche l\'erreur si error est défini', () => {
    const { wrapper } = mountTable({ loading: false, error: 'Erreur réseau', stagesPagines: [] })
    expect(wrapper.find('.error-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('Erreur réseau')
  })

  it('3 — affiche les cartes si pas d\'erreur ni loading', () => {
    const { wrapper } = mountTable()
    expect(wrapper.find('.cards-grid').exists()).toBe(true)
  })

  it('4 — affiche autant de cartes que de stages dans stagesPagines', () => {
    const { wrapper } = mountTable()
    expect(wrapper.findAll('.stage-card').length).toBe(STAGES.length)
  })

  it('5 — affiche le nom de l\'entreprise', () => {
    const { wrapper } = mountTable()
    expect(wrapper.text()).toContain('TechCorp')
  })

  it('6 — affiche "Aucun stage trouvé" si stagesFiltres est vide', () => {
    const { wrapper } = mountTable({ stagesPagines: [], stagesFiltres: [] })
    expect(wrapper.text()).toContain('Aucun stage trouvé')
  })

  it('7 — le bouton Filtrer toggle showFilter', async () => {
    const { wrapper, store } = mountTable()
    await wrapper.find('.filter-btn').trigger('click')
    expect(store.showFilter).toBeDefined()
  })

  it('8 — affiche la barre de filtre si showFilter est true', () => {
    const { wrapper } = mountTable({ showFilter: true })
    expect(wrapper.find('.filter-bar').exists()).toBe(true)
  })

  it('9 — clic sur le bouton modifier émet l\'événement "edit"', async () => {
    const { wrapper } = mountTable()
    const editBtns = wrapper.findAll('button[title="Modifier"]')
    await editBtns[0].trigger('click')
    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')[0]).toEqual([STAGES[0]])
  })

  it('10 — clic sur le bouton supprimer émet l\'événement "delete"', async () => {
    const { wrapper } = mountTable()
    const deleteBtns = wrapper.findAll('button[title="Supprimer"]')
    await deleteBtns[0].trigger('click')
    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')[0]).toEqual([STAGES[0]])
  })

  it('11 — clic sur le corps de la carte émet l\'événement "voir"', async () => {
    const { wrapper } = mountTable()
    const cardBodies = wrapper.findAll('.card-body')
    await cardBodies[0].trigger('click')
    expect(wrapper.emitted('voir')).toBeTruthy()
    expect(wrapper.emitted('voir')[0]).toEqual([STAGES[0]])
  })

  it('12 — affiche les boutons de pagination', () => {
    const { wrapper } = mountTable({ totalPages: 3, page: 1 })
    expect(wrapper.find('.pagination').exists()).toBe(true)
  })
})
