import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { RouterLinkStub } from '@vue/test-utils'
import ProfessionalProfile from '@/views/Professional/ProfessionalProfile.vue'

vi.mock('@/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: { data: {} } }), put: vi.fn() } }))
vi.mock('@/services/professionalApi', () => ({ getProfessionalProfile: vi.fn().mockResolvedValue({}) }))

beforeEach(() => setActivePinia(createPinia()))

describe('ProfessionalProfile.vue — rendu', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(ProfessionalProfile, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('affiche un contenu lié au profil', () => {
    const wrapper = mount(ProfessionalProfile, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.text().toLowerCase()).toMatch(/profil|compte|informations/)
  })
})
