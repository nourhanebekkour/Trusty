import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SettingsView from '@/views/Settings.vue'

// Mock stores to avoid real store dependencies
vi.mock('@/stores/authstore', () => ({
  useAuthStore: vi.fn(() => ({ user: { prenom: 'Test', nom: 'User', role: 'ETUDIANT' }, isAuthenticated: true })),
}))

vi.mock('@/stores/themeStore', () => ({
  useThemeStore: vi.fn(() => ({ isDark: false, toggle: vi.fn() })),
}))

// =============================================================
// TESTS UNITAIRES — SettingsView (placeholder)
// =============================================================

describe('SettingsView — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    setActivePinia(createPinia())
    const wrapper = mount(SettingsView)
    expect(wrapper.exists()).toBe(true)
  })

  it('2 — affiche un contenu visible', () => {
    setActivePinia(createPinia())
    const wrapper = mount(SettingsView)
    expect(wrapper.text().length).toBeGreaterThan(0)
  })

  it('3 — contient un élément racine', () => {
    setActivePinia(createPinia())
    const wrapper = mount(SettingsView)
    expect(wrapper.find('div').exists()).toBe(true)
  })
})
