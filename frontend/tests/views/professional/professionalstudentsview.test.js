import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { RouterLinkStub } from '@vue/test-utils'
import ProfessionalStudents from '@/views/Professional/ProfessionalStudents.vue'

vi.mock('@/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: { data: [] } }) } }))

beforeEach(() => setActivePinia(createPinia()))

describe('ProfessionalStudents.vue — rendu', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(ProfessionalStudents, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('affiche un contenu lié aux étudiants', () => {
    const wrapper = mount(ProfessionalStudents, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.text().toLowerCase()).toMatch(/étudiant|candidat|profil/)
  })
})
