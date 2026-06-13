import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { RouterLinkStub } from '@vue/test-utils'
import ProfessionalPortfolios from '@/views/Professional/ProfessionalPortfolios.vue'

vi.mock('@/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: { data: [] } }) } }))

beforeEach(() => setActivePinia(createPinia()))

describe('ProfessionalPortfolios.vue — rendu', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(ProfessionalPortfolios, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('affiche un contenu lié aux portfolios', () => {
    const wrapper = mount(ProfessionalPortfolios, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.text().toLowerCase()).toMatch(/portfolio|étudiant/)
  })
})
