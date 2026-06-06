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
      { path: '/professor/dashboard',       component: { template: '<div/>' } },
      { path: '/professor/portfolios',      component: { template: '<div/>' } },
      { path: '/professor/validations',     component: { template: '<div/>' } },
      { path: '/professor/messages',        component: { template: '<div/>' } },
      { path: '/professor/notifications',   component: { template: '<div/>' } },
      { path: '/professor/recommendations', component: { template: '<div/>' } },
      { path: '/settings',                  component: { template: '<div/>' } },
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
    expect(wrapper.find('aside.professor-sidebar').exists()).toBe(true)
  })

  it('affiche les liens de navigation', () => {
    const wrapper = mountSidebar()
    expect(wrapper.text()).toContain('Dashboard')
    expect(wrapper.text()).toContain('Portfolios')
    expect(wrapper.text()).toContain('Validations')
    expect(wrapper.text()).toContain('Notifications')
  })

  it('affiche le bouton Logout', () => {
    const wrapper = mountSidebar()
    expect(wrapper.find('.professor-sidebar__logout').exists()).toBe(true)
    expect(wrapper.text()).toContain('Logout')
  })

  it('affiche le lien Settings', () => {
    const wrapper = mountSidebar()
    expect(wrapper.text()).toContain('Settings')
  })
})
