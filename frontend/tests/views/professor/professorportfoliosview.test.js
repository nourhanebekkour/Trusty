import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { RouterLinkStub } from '@vue/test-utils'
import ProfessorPortfolios from '@/views/professor/ProfessorPortfolios.vue'

vi.mock('@/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: { data: [] } }) } }))

beforeEach(() => setActivePinia(createPinia()))

describe('ProfessorPortfolios.vue — rendu', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(ProfessorPortfolios, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('affiche un contenu lié aux portfolios', () => {
    const wrapper = mount(ProfessorPortfolios, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.text().toLowerCase()).toMatch(/portfolio|étudiant/)
  })
})
