import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { RouterLinkStub } from '@vue/test-utils'
import ProfessionalRecommendations from '@/views/Professional/ProfessionalRecommendations.vue'

vi.mock('@/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: { data: [] } }), post: vi.fn() } }))
vi.mock('@/services/professionalApi', () => ({ getProfessionalProfile: vi.fn().mockResolvedValue({}) }))

beforeEach(() => setActivePinia(createPinia()))

describe('ProfessionalRecommendations.vue — rendu', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(ProfessionalRecommendations, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('affiche un contenu lié aux recommandations', () => {
    const wrapper = mount(ProfessionalRecommendations, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.text().toLowerCase()).toMatch(/recommend/)
  })
})
