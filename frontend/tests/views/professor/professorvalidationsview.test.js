import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { RouterLinkStub } from '@vue/test-utils'
import ProfessorValidations from '@/views/professor/ProfessorValidations.vue'

vi.mock('@/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: { data: [] } }), post: vi.fn() } }))

beforeEach(() => setActivePinia(createPinia()))

describe('ProfessorValidations.vue — rendu', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(ProfessorValidations, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('affiche un contenu lié aux validations', () => {
    const wrapper = mount(ProfessorValidations, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.text().toLowerCase()).toMatch(/valid|projet|stage/)
  })
})
