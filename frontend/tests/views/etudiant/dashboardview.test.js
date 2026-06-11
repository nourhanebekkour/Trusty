import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { RouterLinkStub } from '@vue/test-utils'
import EtudiantDashboard from '@/views/Etudiant/Dashboard.vue'

vi.mock('@/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: { data: {} } }) } }))

beforeEach(() => setActivePinia(createPinia()))

describe('Etudiant/Dashboard.vue — rendu', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(EtudiantDashboard, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('affiche un contenu de tableau de bord', () => {
    const wrapper = mount(EtudiantDashboard, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.text().toLowerCase()).toMatch(/dashboard|tableau|bonjour|bienvenue/)
  })
})
