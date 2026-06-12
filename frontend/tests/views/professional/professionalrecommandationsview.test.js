import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { RouterLinkStub } from '@vue/test-utils'
import ProfessionalRecommandations from '@/views/Professional/ProfessionalRecommandations.vue'

vi.mock('@/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: { data: [] } }), post: vi.fn() } }))

beforeEach(() => setActivePinia(createPinia()))

describe('ProfessionalRecommandations.vue — rendu', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(ProfessionalRecommandations, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('affiche un contenu lié aux recommandations', () => {
    const wrapper = mount(ProfessionalRecommandations, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.text().toLowerCase()).toMatch(/recommand/)
  })
})
