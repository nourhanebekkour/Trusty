import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { RouterLinkStub } from '@vue/test-utils'
import ProfessorRecommendations from '@/views/professor/ProfessorRecommendations.vue'

vi.mock('@/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: { data: [] } }) } }))

beforeEach(() => setActivePinia(createPinia()))

describe('ProfessorRecommendations.vue — rendu', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(ProfessorRecommendations, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('affiche un contenu lié aux recommandations', () => {
    const wrapper = mount(ProfessorRecommendations, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.text().toLowerCase()).toMatch(/recommand|lettre/)
  })
})
