import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

// Mock the api module used by StageModal
vi.mock('@/api', () => ({
  default: {
    get:    vi.fn().mockResolvedValue({ data: {} }),
    post:   vi.fn().mockResolvedValue({ data: {} }),
    put:    vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
  },
}))

import StageModal from '@/components/stages/StageModal.vue'

function mountModal(props = {}) {
  return mount(StageModal, {
    props: {
      modelValue: false,
      editMode: false,
      ...props,
    },
    global: { stubs: { Teleport: true } },
  })
}

// ═════════════════════════════════════════════════════════════
// TESTS UNITAIRES — StageModal
// ═════════════════════════════════════════════════════════════

describe('StageModal.vue — Tests Unitaires', () => {

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('1 — ne s\'affiche pas si modelValue est false', () => {
    const wrapper = mountModal({ modelValue: false })
    expect(wrapper.find('.modal').exists()).toBe(false)
  })

  it('2 — s\'affiche si modelValue est true', () => {
    const wrapper = mountModal({ modelValue: true })
    expect(wrapper.find('.modal').exists()).toBe(true)
  })

  it('3 — titre "Nouveau Stage" en mode création', () => {
    const wrapper = mountModal({ modelValue: true, editMode: false })
    expect(wrapper.find('h3.modal-title').text()).toBe('Nouveau Stage')
  })

  it('4 — titre "Modifier le stage" en mode édition', () => {
    const wrapper = mountModal({ modelValue: true, editMode: true })
    expect(wrapper.find('h3.modal-title').text()).toBe('Modifier le stage')
  })

  it('5 — bouton "Suivant →" à l\'étape 0', () => {
    const wrapper = mountModal({ modelValue: true, editMode: false })
    expect(wrapper.find('.btn-submit').exists()).toBe(true)
  })

  it('6 — bouton submit présent en mode édition', () => {
    const wrapper = mountModal({ modelValue: true, editMode: true })
    expect(wrapper.find('.btn-submit').exists()).toBe(true)
  })

  it('7 — bouton submit désactivé quand isStep0Valid est false', () => {
    const wrapper = mountModal({ modelValue: true, editMode: false })
    // Form is empty by default, so step0 is not valid
    expect(wrapper.find('.btn-submit').attributes('disabled')).toBeDefined()
  })

  it('8 — bouton submit affiche "Suivant →" à l\'étape 0', () => {
    const wrapper = mountModal({ modelValue: true, editMode: false })
    expect(wrapper.find('.btn-submit').text()).toContain('Suivant')
  })

  it('9 — émet update:modelValue=false au clic sur le bouton Annuler', async () => {
    const wrapper = mountModal({ modelValue: true, editMode: false })
    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false)
  })

  it('10 — clic sur "×" ferme le modal', async () => {
    const wrapper = mountModal({ modelValue: true })
    await wrapper.find('.modal-close').trigger('click')
    expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false)
  })

  it('11 — affiche les champs Entreprise et Poste', () => {
    const wrapper = mountModal({ modelValue: true })
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThan(1)
  })
})
