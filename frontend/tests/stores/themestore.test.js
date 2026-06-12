import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from '@/stores/themeStore'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

describe('themeStore — état initial', () => {
  it('isDark est false par défaut', () => {
    const store = useThemeStore()
    expect(store.isDark).toBe(false)
  })
})

describe('themeStore — init()', () => {
  it('active le mode sombre si localStorage contient "dark"', () => {
    localStorage.setItem('theme', 'dark')
    const store = useThemeStore()
    store.init()
    expect(store.isDark).toBe(true)
  })

  it('active le mode clair si localStorage contient autre chose', () => {
    localStorage.setItem('theme', 'light')
    const store = useThemeStore()
    store.init()
    expect(store.isDark).toBe(false)
  })
})

describe('themeStore — toggle()', () => {
  it('bascule de clair à sombre', () => {
    const store = useThemeStore()
    expect(store.isDark).toBe(false)
    store.toggle()
    expect(store.isDark).toBe(true)
  })

  it('bascule de sombre à clair', () => {
    const store = useThemeStore()
    store.toggle()
    store.toggle()
    expect(store.isDark).toBe(false)
  })

  it('persiste le thème dans localStorage', () => {
    const store = useThemeStore()
    store.toggle()
    expect(localStorage.getItem('theme')).toBe('dark')
    store.toggle()
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('met à jour l\'attribut data-theme sur <html>', () => {
    const store = useThemeStore()
    store.toggle()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    store.toggle()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })
})
