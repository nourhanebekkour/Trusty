import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { RouterLinkStub } from '@vue/test-utils'
import ProfessionalTopbar from '@/components/Professional/ProfessionalTopbar.vue'

vi.mock('@/stores/authstore', () => ({
  useAuthStore: vi.fn(),
}))
vi.mock('@/stores/themeStore', () => ({
  useThemeStore: vi.fn(),
}))
vi.mock('@/services/professionalApi', () => ({
  getProfessionalProfile: vi.fn().mockResolvedValue({ prenom: 'Jean', nom: 'Dupont' }),
}))

import { useAuthStore }  from '@/stores/authstore'
import { useThemeStore } from '@/stores/themeStore'

let mockToggle

function makeMockStores() {
  mockToggle = vi.fn()
  useAuthStore.mockReturnValue({
    user: { prenom: 'Jean', nom: 'Dupont', avatar: null },
  })
  useThemeStore.mockReturnValue({ isDark: false, toggle: mockToggle })
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  makeMockStores()
})

const mountTopbar = () => mount(ProfessionalTopbar, {
  global: { stubs: { RouterLink: RouterLinkStub } },
})

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — ProfessionalTopbar
// ═══════════════════════════════════════════════════════

describe('ProfessionalTopbar.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    expect(mountTopbar().exists()).toBe(true)
  })

  it('2 — contient nav.navbar', () => {
    expect(mountTopbar().find('nav.navbar').exists()).toBe(true)
  })

  it('3 — affiche le texte "TRUSTY"', () => {
    expect(mountTopbar().find('.logo-text').text()).toBe('TRUSTY')
  })

  it('4 — affiche le rôle "Professionnel"', () => {
    expect(mountTopbar().find('.user-role').text()).toBe('Professionnel')
  })

  it('5 — affiche le bouton .theme-toggle', () => {
    expect(mountTopbar().find('.theme-toggle').exists()).toBe(true)
  })

  it('6 — affiche la zone .notif-wrap (icône notifications)', () => {
    expect(mountTopbar().find('.notif-wrap').exists()).toBe(true)
  })

  it('7 — affiche le badge .notif-badge', () => {
    expect(mountTopbar().find('.notif-badge').exists()).toBe(true)
  })

  it('8 — affiche l\'avatar utilisateur .user-avatar', () => {
    expect(mountTopbar().find('.user-avatar').exists()).toBe(true)
  })

  it('9 — affiche .user-info avec le lien profil', () => {
    expect(mountTopbar().find('.user-info').exists()).toBe(true)
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — ProfessionalTopbar
// ═══════════════════════════════════════════════════════

describe('ProfessionalTopbar.vue — Tests d\'Intégration', () => {

  it('10 — clic sur .theme-toggle appelle theme.toggle()', async () => {
    const wrapper = mountTopbar()
    await wrapper.find('.theme-toggle').trigger('click')
    expect(mockToggle).toHaveBeenCalledTimes(1)
  })

  it('11 — plusieurs clics sur theme-toggle appellent toggle() à chaque fois', async () => {
    const wrapper = mountTopbar()
    await wrapper.find('.theme-toggle').trigger('click')
    await wrapper.find('.theme-toggle').trigger('click')
    expect(mockToggle).toHaveBeenCalledTimes(2)
  })
})
