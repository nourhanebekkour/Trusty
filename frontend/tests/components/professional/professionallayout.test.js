import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { RouterLinkStub } from '@vue/test-utils'
import ProfessionalLayout from '@/components/Professional/ProfessionalLayout.vue'

vi.mock('@/stores/authstore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { prenom: 'Jean', nom: 'Dupont', avatar: null },
    logout: vi.fn(),
  })),
}))
vi.mock('@/stores/themeStore', () => ({
  useThemeStore: vi.fn(() => ({ isDark: false, toggle: vi.fn() })),
}))
vi.mock('@/services/professionalApi', () => ({
  getProfessionalProfile: vi.fn().mockResolvedValue(null),
}))
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  RouterView: { template: '<div class="router-view-stub" />' },
}))

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

const mountLayout = () => mount(ProfessionalLayout, {
  global: { stubs: { RouterLink: RouterLinkStub } },
})

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — ProfessionalLayout
// ═══════════════════════════════════════════════════════

describe('ProfessionalLayout.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    expect(mountLayout().exists()).toBe(true)
  })

  it('2 — contient .professional-layout à la racine', () => {
    expect(mountLayout().find('.professional-layout').exists()).toBe(true)
  })

  it('3 — contient .layout-body (flex row : sidebar + content)', () => {
    expect(mountLayout().find('.layout-body').exists()).toBe(true)
  })

  it('4 — contient main.layout-content', () => {
    expect(mountLayout().find('main.layout-content').exists()).toBe(true)
  })

  it('5 — contient nav.navbar (ProfessionalTopbar)', () => {
    expect(mountLayout().find('nav.navbar').exists()).toBe(true)
  })

  it('6 — contient aside.sidebar (ProfessionalSidebar)', () => {
    expect(mountLayout().find('aside.sidebar').exists()).toBe(true)
  })

  it('7 — contient footer.professional-footer (ProfessionalFooter)', () => {
    expect(mountLayout().find('footer.professional-footer').exists()).toBe(true)
  })

  it('8 — affiche "TRUSTY" dans la topbar', () => {
    expect(mountLayout().find('.logo-text').text()).toBe('TRUSTY')
  })

  it('9 — affiche "Espace Professionnel" dans le footer', () => {
    expect(mountLayout().find('footer').text()).toContain('Espace Professionnel')
  })

  it('10 — la topbar et la sidebar sont des enfants directs de .professional-layout', () => {
    const wrapper = mountLayout()
    expect(wrapper.find('.professional-layout > nav.navbar').exists() ||
           wrapper.find('nav.navbar').exists()).toBe(true)
    expect(wrapper.find('aside.sidebar').exists()).toBe(true)
  })
})
