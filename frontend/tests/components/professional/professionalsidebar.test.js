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

  it('4 — affiche le lien Dashboard', () => {
    expect(mountSidebar().text()).toContain('Dashboard')
  })

  it('5 — affiche le lien Recommandations', () => {
    expect(mountSidebar().text()).toContain('Recommandations')
  })

  it('6 — affiche le lien Commentaires', () => {
    expect(mountSidebar().text()).toContain('Commentaires')
  })

  it('7 — affiche le lien Notifications', () => {
    expect(mountSidebar().text()).toContain('Notifications')
  })

  it('8 — affiche le lien Historique', () => {
    expect(mountSidebar().text()).toContain('Historique')
  })

  it('9 — affiche le lien Stages', () => {
    expect(mountSidebar().text()).toContain('Stages')
  })

  it('10 — affiche le lien Projets', () => {
    expect(mountSidebar().text()).toContain('Projets')
  })

  it('11 — affiche le lien Étudiants', () => {
    expect(mountSidebar().text()).toContain('Étudiants')
  })

  it('12 — affiche le lien Portfolios', () => {
    expect(mountSidebar().text()).toContain('Portfolios')
  })

  it('13 — affiche le lien Mon Profil dans .sidebar-bottom', () => {
    expect(mountSidebar().find('.sidebar-bottom').text()).toContain('Mon Profil')
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
