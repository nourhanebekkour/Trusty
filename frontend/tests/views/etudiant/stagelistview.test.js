import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { defineComponent } from 'vue'

vi.mock('@/stores/stageStore', () => ({
  useStageStore: vi.fn(),
}))

vi.mock('@/components/stages/StageStats.vue',      () => ({ default: defineComponent({ name: 'StageStats',      props: ['stats'],   template: '<div class="mock-stats" />' }) }))
vi.mock('@/components/stages/StageTable.vue',      () => ({ default: defineComponent({ name: 'StageTable',                         template: '<div class="mock-table" />' }) }))
vi.mock('@/components/stages/StageModal.vue',      () => ({ default: defineComponent({ name: 'StageModal',                         template: '<div class="mock-modal" />' }) }))
vi.mock('@/components/stages/StageBottomGrid.vue', () => ({ default: defineComponent({ name: 'StageBottomGrid',                    template: '<div class="mock-bottomgrid" />' }) }))

import { useStageStore } from '@/stores/stageStore'
import StageList from '@/views/Etudiant/StageList.vue'

function makeStore(overrides = {}) {
  const store = {
    stats:      { total: 3, valides: 1, enAttente: 2 },
    toast:      { show: false, type: 'success', message: '' },
    modal:      { open: false, mode: 'create', stageId: null },
    init:       vi.fn().mockResolvedValue(undefined),
    openModal:  vi.fn(),
    showToast:  vi.fn(),
    ...overrides,
  }
  useStageStore.mockReturnValue(store)
  return store
}

function mountView(storeOverrides = {}) {
  const store = makeStore(storeOverrides)
  return { wrapper: mount(StageList, { global: { stubs: { Teleport: true } } }), store }
}

// ═════════════════════════════════════════════════════════════
// TESTS UNITAIRES — StageList (view)
// ═════════════════════════════════════════════════════════════

describe('StageList.vue (view) — Tests Unitaires', () => {

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('1 — affiche le titre "Gestion des Stages"', () => {
    const { wrapper } = mountView()
    expect(wrapper.text()).toContain('Gestion des Stages')
  })

  it('2 — affiche le sous-titre descriptif', () => {
    const { wrapper } = mountView()
    expect(wrapper.text()).toContain('expériences professionnelles')
  })

  it('3 — affiche le bouton "Nouveau stage"', () => {
    const { wrapper } = mountView()
    expect(wrapper.text()).toContain('Nouveau stage')
  })

  it('4 — monte le composant StageStats', () => {
    const { wrapper } = mountView()
    expect(wrapper.find('.mock-stats').exists()).toBe(true)
  })

  it('5 — monte le composant StageTable', () => {
    const { wrapper } = mountView()
    expect(wrapper.find('.mock-table').exists()).toBe(true)
  })

  it('6 — monte le composant StageModal', () => {
    const { wrapper } = mountView()
    expect(wrapper.find('.mock-modal').exists()).toBe(true)
  })

  it('7 — monte le composant StageBottomGrid', () => {
    const { wrapper } = mountView()
    expect(wrapper.find('.mock-bottomgrid').exists()).toBe(true)
  })

  it('8 — clic "Nouveau stage" appelle store.openModal("create")', async () => {
    const { wrapper, store } = mountView()
    await wrapper.find('.btn-new').trigger('click')
    expect(store.openModal).toHaveBeenCalledWith('create')
  })

  it('9 — affiche le toast si store.toast.show est true', () => {
    const { wrapper } = mountView({ toast: { show: true, type: 'success', message: 'Stage créé !' } })
    expect(wrapper.text()).toContain('Stage créé !')
  })

  it('10 — n\'affiche pas le toast si store.toast.show est false', () => {
    const { wrapper } = mountView({ toast: { show: false, type: 'success', message: 'Stage créé !' } })
    expect(wrapper.find('.toast').exists()).toBe(false)
  })
})

// ═════════════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — StageList (view)
// ═════════════════════════════════════════════════════════════

describe("StageList.vue (view) — Tests d'Intégration", () => {

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('11 — appelle store.init() au montage', async () => {
    const { store } = mountView()
    await flushPromises()
    expect(store.init).toHaveBeenCalledTimes(1)
  })

  it('12 — passe store.stats à StageStats', () => {
    const stats = { total: 5, valides: 3, enAttente: 2 }
    const { wrapper } = mountView({ stats })
    const comp = wrapper.findComponent({ name: 'StageStats' })
    expect(comp.props('stats')).toEqual(stats)
  })
})
