import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

vi.mock('@/stores/authstore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { prenom: 'Prof', nom: 'Test' },
    logout: vi.fn(),
  }))
}))

import ProfessorSidebar from '@/components/professor/ProfessorSideBar.vue'

function mountSidebar() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/professor', component: { template: '<div/>' } },
      { path: '/login',     component: { template: '<div/>' } },
    ],
  })
  setActivePinia(createPinia())
  return mount(ProfessorSidebar, {
    global: { plugins: [createPinia(), router] }
  })
}

describe('ProfessorSidebar.vue — rendu', () => {
  it('se monte sans erreur', () => {
    const wrapper = mountSidebar()
    expect(wrapper.find('aside.sidebar').exists()).toBe(true)
  })

  it('affiche les liens de navigation', () => {
    const wrapper = mountSidebar()
    expect(wrapper.text()).toContain('Projets à valider')
    expect(wrapper.text()).toContain('Stages à valider')
    expect(wrapper.text()).toContain('Mes étudiants')
    expect(wrapper.text()).toContain('Notifications')
  })

  it('affiche le bouton Déconnexion', () => {
    const wrapper = mountSidebar()
    expect(wrapper.find('.logout-btn').exists()).toBe(true)
    expect(wrapper.text()).toContain('Déconnexion')
  })

  it('affiche le lien Paramètres', () => {
    const wrapper = mountSidebar()
    expect(wrapper.text()).toContain('Paramètres')
  })

  it('affiche le bouton toggle collapse', () => {
    const wrapper = mountSidebar()
    expect(wrapper.find('.toggle-btn').exists()).toBe(true)
  })
})
