import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { RouterLinkStub } from '@vue/test-utils'
import ProfessionalCommentaires from '@/views/Professional/ProfessionalCommentaires.vue'

vi.mock('@/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: { data: [] } }) } }))

beforeEach(() => setActivePinia(createPinia()))

describe('ProfessionalCommentaires.vue — rendu', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(ProfessionalCommentaires, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('affiche un contenu lié aux commentaires', () => {
    const wrapper = mount(ProfessionalCommentaires, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.text().toLowerCase()).toMatch(/commentaire|avis|feedback/)
  })
})
