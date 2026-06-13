import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ProfessorTopbar from '@/components/professor/ProfessorTopbar.vue'

vi.mock('@/stores/authstore', () => ({
  useAuthStore: vi.fn(),
}))
vi.mock('@/stores/themeStore', () => ({
  useThemeStore: vi.fn(),
}))
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

import { useAuthStore }  from '@/stores/authstore'
import { useThemeStore } from '@/stores/themeStore'
import { useRouter }     from 'vue-router'

let mockToggle
let mockRouterPush

function makeMockStores() {
  mockToggle     = vi.fn()
  mockRouterPush = vi.fn()
  useAuthStore.mockReturnValue({
    user: { prenom: 'Jean', nom: 'Dupont', role: 'PROFESSEUR', photo: null },
    fetchUser: vi.fn(),
  })
  useThemeStore.mockReturnValue({ isDark: false, toggle: mockToggle })
  useRouter.mockReturnValue({ push: mockRouterPush })
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  makeMockStores()
})

const mountTopbar = () => mount(ProfessorTopbar)

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — ProfessorTopbar
// ═══════════════════════════════════════════════════════

describe('ProfessorTopbar.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    expect(mountTopbar().exists()).toBe(true)
  })

  it('2 — contient nav.navbar', () => {
    expect(mountTopbar().find('nav.navbar').exists()).toBe(true)
  })

  it('3 — affiche "TRUSTY" dans le logo', () => {
    expect(mountTopbar().find('.logo-text').text()).toBe('TRUSTY')
  })

  it('4 — affiche le rôle "Professeur" (depuis PROFESSEUR)', () => {
    expect(mountTopbar().find('.user-role').text()).toBe('Professeur')
  })

  it('5 — affiche le nom de l\'utilisateur', () => {
    expect(mountTopbar().find('.user-name').text()).toContain('Jean')
  })

  it('6 — le bouton .theme-toggle est présent', () => {
    expect(mountTopbar().find('.theme-toggle').exists()).toBe(true)
  })

  it('7 — la zone .notif-wrap est présente', () => {
    expect(mountTopbar().find('.notif-wrap').exists()).toBe(true)
  })

  it('8 — la zone .user-info est présente', () => {
    expect(mountTopbar().find('.user-info').exists()).toBe(true)
  })

  it('9 — l\'avatar .user-avatar est présent (pas de photo)', () => {
    expect(mountTopbar().find('.user-avatar').exists()).toBe(true)
  })

  it('10 — les initiales affichées sont "JD"', () => {
    expect(mountTopbar().find('.user-avatar').text()).toBe('JD')
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — ProfessorTopbar
// ═══════════════════════════════════════════════════════

describe('ProfessorTopbar.vue — Tests d\'Intégration', () => {

  it('11 — clic sur .theme-toggle appelle theme.toggle()', async () => {
    const wrapper = mountTopbar()
    await wrapper.find('.theme-toggle').trigger('click')
    expect(mockToggle).toHaveBeenCalledTimes(1)
  })

  it('12 — clic sur .notif-wrap appelle router.push("/professor/notifications")', async () => {
    const wrapper = mountTopbar()
    await wrapper.find('.notif-wrap').trigger('click')
    expect(mockRouterPush).toHaveBeenCalledWith('/professor/notifications')
  })

  it('13 — plusieurs clics sur theme-toggle l\'appellent à chaque fois', async () => {
    const wrapper = mountTopbar()
    await wrapper.find('.theme-toggle').trigger('click')
    await wrapper.find('.theme-toggle').trigger('click')
    expect(mockToggle).toHaveBeenCalledTimes(2)
  })
})
