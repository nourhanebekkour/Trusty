import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { RouterLinkStub } from '@vue/test-utils'
import ProfessorLayout from '@/components/professor/ProfessorLayout.vue'

vi.mock('@/stores/authstore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { prenom: 'Jean', nom: 'Dupont', role: 'PROFESSEUR', photo: null },
    logout:    vi.fn().mockResolvedValue(undefined),
    fetchUser: vi.fn(),
  })),
}))
vi.mock('@/stores/themeStore', () => ({
  useThemeStore: vi.fn(() => ({ isDark: false, toggle: vi.fn() })),
}))
vi.mock('vue-router', () => ({
  useRouter:    vi.fn(() => ({ push: vi.fn() })),
  RouterView:   { template: '<div class="router-view-stub" />' },
}))

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

const mountLayout = () => mount(ProfessorLayout, {
  global: { stubs: { RouterLink: RouterLinkStub } },
})

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — ProfessorLayout
// ═══════════════════════════════════════════════════════

describe('ProfessorLayout.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    expect(mountLayout().exists()).toBe(true)
  })

  it('2 — contient .professor-layout à la racine', () => {
    expect(mountLayout().find('.professor-layout').exists()).toBe(true)
  })

  it('3 — contient .professor-layout__body', () => {
    expect(mountLayout().find('.professor-layout__body').exists()).toBe(true)
  })

  it('4 — contient .professor-layout__main', () => {
    expect(mountLayout().find('.professor-layout__main').exists()).toBe(true)
  })

  it('5 — contient nav.navbar (ProfessorTopbar)', () => {
    expect(mountLayout().find('nav.navbar').exists()).toBe(true)
  })

  it('6 — contient aside.sidebar (ProfessorSidebar)', () => {
    expect(mountLayout().find('aside.sidebar').exists()).toBe(true)
  })

  it('7 — affiche "TRUSTY" dans la topbar', () => {
    expect(mountLayout().find('.logo-text').text()).toBe('TRUSTY')
  })

  it('8 — la sidebar contient le lien Dashboard', () => {
    expect(mountLayout().find('.sidebar-nav').text()).toContain('Dashboard')
  })

  it('9 — la sidebar contient le lien Validations', () => {
    expect(mountLayout().find('.sidebar-nav').text()).toContain('Validations')
  })

  it('10 — la sidebar contient le bouton Déconnexion', () => {
    expect(mountLayout().find('.logout-btn').exists()).toBe(true)
  })
})
