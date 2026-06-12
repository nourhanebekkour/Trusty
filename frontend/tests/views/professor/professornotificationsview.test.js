import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { RouterLinkStub } from '@vue/test-utils'
import ProfessorNotifications from '@/views/professor/ProfessorNotifications.vue'

vi.mock('@/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: { data: [] } }), put: vi.fn() } }))

beforeEach(() => setActivePinia(createPinia()))

describe('ProfessorNotifications.vue — rendu', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(ProfessorNotifications, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('affiche un contenu lié aux notifications', () => {
    const wrapper = mount(ProfessorNotifications, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.text().toLowerCase()).toMatch(/notif|activité|message/)
  })
})
