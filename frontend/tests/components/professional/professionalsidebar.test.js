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
    // Source has only 4 nav items: Profil, Recommandations, Portfolio, Notifications
    expect(mountSidebar().text()).toContain('Portfolio')
  })

  it('7 — affiche le lien Notifications', () => {
    expect(mountSidebar().text()).toContain('Notifications')
  })

  it('8 — affiche Paramètres dans .sidebar-bottom', () => {
    expect(mountSidebar().find('.sidebar-bottom').text()).toContain('Paramètres')
  })

  it('9 — affiche exactement 4 items dans .sidebar-nav', () => {
    // Source: Profil, Recommandations, Portfolio, Notifications
    expect(mountSidebar().findAll('.sidebar-nav .nav-item').length).toBe(4)
  })

  it('10 — le 1er item nav est Profil', () => {
    const items = mountSidebar().findAll('.sidebar-nav .nav-item')
    expect(items[0].text()).toContain('Profil')
  })

  it('11 — le 2e item nav est Recommandations', () => {
    const items = mountSidebar().findAll('.sidebar-nav .nav-item')
    expect(items[1].text()).toContain('Recommandations')
  })

  it('12 — le 3e item nav est Portfolio', () => {
    const items = mountSidebar().findAll('.sidebar-nav .nav-item')
    expect(items[2].text()).toContain('Portfolio')
  })

  it('13 — le 4e item nav est Notifications', () => {
    const items = mountSidebar().findAll('.sidebar-nav .nav-item')
    expect(items[3].text()).toContain('Notifications')
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
