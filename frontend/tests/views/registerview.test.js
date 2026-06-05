import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

vi.mock('@/stores/authstore', () => ({
  useAuthStore: vi.fn(),
}))

import { useAuthStore } from '@/stores/authstore'
import RegisterView from '@/views/registerview.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/login', name: 'login', component: { template: '<div />' } },
    { path: '/register', name: 'register', component: RegisterView },
  ],
})

function mountRegister(storeOverrides = {}) {
  const mockStore = {
    error:    null,
    loading:  false,
    register: vi.fn().mockResolvedValue(true),
    ...storeOverrides,
  }
  useAuthStore.mockReturnValue(mockStore)
  return {
    wrapper: mount(RegisterView, { global: { plugins: [router] } }),
    mockStore,
  }
}

// ═════════════════════════════════════════════════════════════
// TESTS UNITAIRES — RegisterView
// ═════════════════════════════════════════════════════════════

describe('RegisterView — Tests Unitaires', () => {

  beforeEach(async () => {
    setActivePinia(createPinia())
    await router.push('/register')
    await router.isReady()
    vi.clearAllMocks()
  })

  it('1 — affiche le champ Prénom', () => {
    const { wrapper } = mountRegister()
    expect(wrapper.find('input[placeholder="John"]').exists()).toBe(true)
  })

  it('2 — affiche le champ Nom', () => {
    const { wrapper } = mountRegister()
    expect(wrapper.find('input[placeholder="Doe"]').exists()).toBe(true)
  })

  it('3 — affiche le champ Email', () => {
    const { wrapper } = mountRegister()
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
  })

  it('4 — affiche le champ Mot de passe', () => {
    const { wrapper } = mountRegister()
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
  })

  it('5 — affiche le bouton "Créer mon compte"', () => {
    const { wrapper } = mountRegister()
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toContain('Créer mon compte')
  })

  it('6 — le bouton affiche "Création en cours..." quand loading est true', () => {
    const { wrapper } = mountRegister({ loading: true })
    expect(wrapper.find('button[type="submit"]').text()).toContain('Création en cours...')
  })

  it('7 — le bouton est désactivé quand loading est true', () => {
    const { wrapper } = mountRegister({ loading: true })
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('8 — affiche le message d\'erreur si authStore.error est défini', () => {
    const { wrapper } = mountRegister({ error: 'Email déjà utilisé' })
    expect(wrapper.find('.global-error').exists()).toBe(true)
    expect(wrapper.find('.global-error').text()).toBe('Email déjà utilisé')
  })

  it('9 — n\'affiche pas d\'erreur si authStore.error est null', () => {
    const { wrapper } = mountRegister({ error: null })
    expect(wrapper.find('.global-error').exists()).toBe(false)
  })
})

// ═════════════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — RegisterView
// ═════════════════════════════════════════════════════════════

describe("RegisterView — Tests d'Intégration", () => {

  beforeEach(async () => {
    setActivePinia(createPinia())
    await router.push('/register')
    await router.isReady()
    vi.clearAllMocks()
  })

  it('10 — submit appelle authStore.register avec les données du formulaire', async () => {
    const { wrapper, mockStore } = mountRegister()
    await wrapper.find('input[value="PROFESSIONNEL"]').setChecked()
    await wrapper.find('input[placeholder="John"]').setValue('Fatine')
    await wrapper.find('input[placeholder="Doe"]').setValue('Ben')
    await wrapper.find('input[type="email"]').setValue('fatine@test.com')
    await wrapper.find('input[type="password"]').setValue('Pass1!abc')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(mockStore.register).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'fatine@test.com', nom: 'Ben', prenom: 'Fatine' })
    )
  })

  it('11 — inscription réussie redirige vers /login', async () => {
    const { wrapper, mockStore } = mountRegister()
    mockStore.register.mockResolvedValue(true)
    await wrapper.find('input[value="PROFESSIONNEL"]').setChecked()
    await wrapper.find('input[placeholder="John"]').setValue('Fatine')
    await wrapper.find('input[placeholder="Doe"]').setValue('Ben')
    await wrapper.find('input[type="email"]').setValue('fatine@test.com')
    await wrapper.find('input[type="password"]').setValue('Pass1!abc')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('12 — inscription échouée ne redirige pas', async () => {
    await router.push('/register')
    const { wrapper, mockStore } = mountRegister()
    mockStore.register.mockResolvedValue(false)
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/register')
  })
})
