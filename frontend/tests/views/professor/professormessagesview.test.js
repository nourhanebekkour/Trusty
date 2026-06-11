import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { RouterLinkStub } from '@vue/test-utils'
import ProfessorMessages from '@/views/professor/ProfessorMessages.vue'

vi.mock('@/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: { data: [] } }) } }))

beforeEach(() => setActivePinia(createPinia()))

describe('ProfessorMessages.vue — rendu', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(ProfessorMessages, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('affiche un contenu lié aux messages', () => {
    const wrapper = mount(ProfessorMessages, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.text().toLowerCase()).toMatch(/message|discussion|conversation/)
  })
})
