import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { RouterLinkStub } from '@vue/test-utils'
import ProfessionalProjects from '@/views/Professional/ProfessionalProjects.vue'

vi.mock('@/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: { data: [] } }) } }))

beforeEach(() => setActivePinia(createPinia()))

describe('ProfessionalProjects.vue — rendu', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(ProfessionalProjects, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('affiche un contenu lié aux projets', () => {
    const wrapper = mount(ProfessionalProjects, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.text().toLowerCase()).toMatch(/projet|project/)
  })
})
