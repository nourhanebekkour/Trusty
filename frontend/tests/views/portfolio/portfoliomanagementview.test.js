import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { RouterLinkStub } from '@vue/test-utils'
import PortfolioManagement from '@/views/portfolio/PortfolioManagement.vue'

vi.mock('@/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: { data: [] } }), put: vi.fn(), post: vi.fn() } }))

beforeEach(() => setActivePinia(createPinia()))

describe('PortfolioManagement.vue — rendu', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(PortfolioManagement, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('affiche un contenu lié au portfolio', () => {
    const wrapper = mount(PortfolioManagement, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.text().toLowerCase()).toMatch(/portfolio|section|publier/)
  })
})
