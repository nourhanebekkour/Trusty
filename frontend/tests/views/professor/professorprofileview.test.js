import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { RouterLinkStub } from '@vue/test-utils'
import ProfessorProfile from '@/views/professor/ProfessorProfile.vue'

vi.mock('@/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: { data: {} } }), put: vi.fn() } }))

beforeEach(() => setActivePinia(createPinia()))

describe('ProfessorProfile.vue — rendu', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(ProfessorProfile, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('affiche un contenu lié au profil', () => {
    const wrapper = mount(ProfessorProfile, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.text().toLowerCase()).toMatch(/profil|compte|informations/)
  })
})
