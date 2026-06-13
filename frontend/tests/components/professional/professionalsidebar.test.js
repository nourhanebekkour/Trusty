import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { RouterLinkStub } from '@vue/test-utils'
import ProfessionalSidebar from '@/components/Professional/ProfessionalSidebar.vue'

vi.mock('@/stores/authstore', () => ({
  useAuthStore: vi.fn(),
}))
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

import { useAuthStore } from '@/stores/authstore'

let mockLogout

function makeMockAuthStore() {
  mockLogout = vi.fn().mockResolvedValue(undefined)
  return { user: { prenom: 'Jean', nom: 'Pro' }, logout: mockLogout }
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  useAuthStore.mockReturnValue(makeMockAuthStore())
})

const mountSidebar = () => mount(ProfessionalSidebar, {
  global: { stubs: { RouterLink: RouterLinkStub } },
})

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — ProfessionalSidebar
// ═══════════════════════════════════════════════════════

describe('ProfessionalSidebar.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    expect(mountSidebar().exists()).toBe(true)
  })

  it('2 — contient la balise <aside class="sidebar">', () => {
    expect(mountSidebar().find('aside.sidebar').exists()).toBe(true)
  })

  it('3 — contient une nav .sidebar-nav', () => {
    expect(mountSidebar().find('.sidebar-nav').exists()).toBe(true)
  })

  it('4 — affiche le lien Profil', () => {
    expect(mountSidebar().text()).toContain('Profil')
  })

  it('5 — affiche le lien Recommandations', () => {
    expect(mountSidebar().text()).toContain('Recommandations')
  })

  it('6 — affiche le lien Portfolio', () => {
    expect(mountSidebar().text()).toContain('Portfolio')
  })

  it('7 — affiche le lien Notifications', () => {
    expect(mountSidebar().text()).toContain('Notifications')
  })

  it('8 — affiche le lien Paramètres dans .sidebar-bottom', () => {
    expect(mountSidebar().find('.sidebar-bottom').text()).toContain('Paramètres')
  })

  it('9 — la nav contient 4 liens', () => {
    expect(mountSidebar().findAll('.sidebar-nav .nav-item')).toHaveLength(4)
  })

  it('10 — le sidebar-bottom contient 2 éléments', () => {
    expect(mountSidebar().find('.sidebar-bottom').findAll('.nav-item')).toHaveLength(2)
  })

  it('11 — affiche le logo Profil comme nav-icon', () => {
    expect(mountSidebar().find('.sidebar-nav .nav-icon').exists()).toBe(true)
  })

  it('12 — chaque nav-item de la nav a une icône et un label', () => {
    const items = mountSidebar().findAll('.sidebar-nav .nav-item')
    items.forEach(item => {
      expect(item.find('.nav-icon').exists()).toBe(true)
      expect(item.find('.nav-label').exists()).toBe(true)
    })
  })

  it('13 — affiche Paramètres dans .sidebar-bottom', () => {
    expect(mountSidebar().find('.sidebar-bottom').text()).toContain('Paramètres')
  })

  it('14 — affiche le bouton Déconnexion', () => {
    expect(mountSidebar().find('.logout-btn').exists()).toBe(true)
    expect(mountSidebar().text()).toContain('Déconnexion')
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — ProfessionalSidebar
// ═══════════════════════════════════════════════════════

describe('ProfessionalSidebar.vue — Tests d\'Intégration', () => {

  it('15 — clic sur Déconnexion appelle authStore.logout()', async () => {
    const wrapper = mountSidebar()
    await wrapper.find('.logout-btn').trigger('click')
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })
})
