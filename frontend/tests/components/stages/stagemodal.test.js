import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/stores/stageStore', () => ({
  useStageStore: vi.fn(),
}))

import { useStageStore } from '@/stores/stageStore'
import StageModal from '@/components/stages/StageModal.vue'

function makeStore(overrides = {}) {
  const mockStore = {
    modal:       { open: false, mode: 'create', stageId: null },
    form:        { entreprise: '', poste: '', adresse_entreprise: '', encadrant_professionnel: '', encadrant_academique: '', duree_semaines: null, date_debut: '', date_fin: '', missions: '', est_public: true },
    saving:      false,
    sauvegarder: vi.fn(),
    ...overrides,
  }
  useStageStore.mockReturnValue(mockStore)
  return mockStore
}

function mountModal(storeOverrides = {}) {
  const store = makeStore(storeOverrides)
  return {
    wrapper: mount(StageModal, { global: { stubs: { Teleport: true } } }),
    store,
  }
}

// ═════════════════════════════════════════════════════════════
// TESTS UNITAIRES — StageModal
// ═════════════════════════════════════════════════════════════

describe('StageModal.vue — Tests Unitaires', () => {

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('1 — ne s\'affiche pas si modal.open est false', () => {
    const { wrapper } = mountModal({ modal: { open: false, mode: 'create', stageId: null } })
    expect(wrapper.find('.modal').exists()).toBe(false)
  })

  it('2 — s\'affiche si modal.open est true', () => {
    const { wrapper } = mountModal({ modal: { open: true, mode: 'create', stageId: null } })
    expect(wrapper.find('.modal').exists()).toBe(true)
  })

  it('3 — titre "Nouveau stage" en mode create', () => {
    const { wrapper } = mountModal({ modal: { open: true, mode: 'create', stageId: null } })
    expect(wrapper.find('h2').text()).toBe('Nouveau stage')
  })

  it('4 — titre "Modifier le stage" en mode edit', () => {
    const { wrapper } = mountModal({ modal: { open: true, mode: 'edit', stageId: 5 } })
    expect(wrapper.find('h2').text()).toBe('Modifier le stage')
  })

  it('5 — bouton "Créer le stage" en mode create', () => {
    const { wrapper } = mountModal({ modal: { open: true, mode: 'create', stageId: null } })
    expect(wrapper.find('.btn-new').text()).toContain('Créer le stage')
  })

  it('6 — bouton "Enregistrer" en mode edit', () => {
    const { wrapper } = mountModal({ modal: { open: true, mode: 'edit', stageId: 5 } })
    expect(wrapper.find('.btn-new').text()).toContain('Enregistrer')
  })

  it('7 — bouton submit désactivé quand saving est true', () => {
    const { wrapper } = mountModal({ modal: { open: true, mode: 'create', stageId: null }, saving: true })
    expect(wrapper.find('.btn-new').attributes('disabled')).toBeDefined()
  })

  it('8 — bouton submit affiche "Enregistrement..." quand saving est true', () => {
    const { wrapper } = mountModal({ modal: { open: true, mode: 'create', stageId: null }, saving: true })
    expect(wrapper.find('.btn-new').text()).toContain('Enregistrement...')
  })

  it('9 — clic sur le bouton submit appelle store.sauvegarder()', async () => {
    const { wrapper, store } = mountModal({ modal: { open: true, mode: 'create', stageId: null } })
    await wrapper.find('.btn-new').trigger('click')
    expect(store.sauvegarder).toHaveBeenCalled()
  })

  it('10 — clic sur "Annuler" ferme le modal', async () => {
    const store = makeStore({ modal: { open: true, mode: 'create', stageId: null } })
    mount(StageModal, { global: { stubs: { Teleport: true } } })
    store.modal.open = false
    expect(store.modal.open).toBe(false)
  })

  it('11 — affiche les champs Entreprise et Poste', () => {
    const { wrapper } = mountModal({ modal: { open: true, mode: 'create', stageId: null } })
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThan(1)
  })
})
