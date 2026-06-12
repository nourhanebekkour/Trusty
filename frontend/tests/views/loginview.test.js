import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock('@/stores/authstore', () => ({
  useAuthStore: vi.fn(),
}))

import { useAuthStore } from '@/stores/authstore'
import LoginView from '@/views/loginview.vue'

// ─── Router minimal ───────────────────────────────────────────────────────────
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home',      component: { template: '<div>Home</div>' } },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
  ],
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mountLogin(storeOverrides = {}) {
  const mockStore = {
    error: null,
    loading: false,
    login: vi.fn().mockResolvedValue(false),
    ...storeOverrides,
  }
  useAuthStore.mockReturnValue(mockStore)

  return {
    wrapper: mount(LoginView, {
      global: { plugins: [router] },
    }),
    mockStore,
  }
}

// ════════════════════════════════════════════════════════════════════════════
// TESTS UNITAIRES
// ════════════════════════════════════════════════════════════════════════════
describe('LoginView — Tests Unitaires', () => {

  beforeEach(async () => {
    setActivePinia(createPinia())
    await router.push('/login')
    await router.isReady()
    vi.clearAllMocks()
  })

  // ── Rendu ───────────────────────────────────────────────────────────────────

  it('1 — affiche le champ email', () => {
    const { wrapper } = mountLogin()
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
  })

  it('2 — affiche le champ mot de passe', () => {
    const { wrapper } = mountLogin()
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
  })

  it('3 — affiche le bouton Se connecter', () => {
    const { wrapper } = mountLogin()
    const btn = wrapper.find('button.btn-login')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toContain('Se connecter')
  })

  it('4 — affiche la checkbox Se souvenir de moi', () => {
    const { wrapper } = mountLogin()
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
  })

  it('5 — le bouton est désactivé si email vide', async () => {
    const { wrapper } = mountLogin()
    await wrapper.find('input[type="password"]').setValue('Password1!')
    const btn = wrapper.find('button.btn-login')
    expect(btn.attributes('disabled')).toBeDefined()
  })

  it('6 — le bouton est désactivé si mot de passe vide', async () => {
    const { wrapper } = mountLogin()
    await wrapper.find('input[type="email"]').setValue('alice@test.com')
    const btn = wrapper.find('button.btn-login')
    expect(btn.attributes('disabled')).toBeDefined()
  })

  it('7 — le bouton est activé si email et mot de passe remplis', async () => {
    const { wrapper } = mountLogin()
    await wrapper.find('input[type="email"]').setValue('alice@test.com')
    await wrapper.find('input[type="password"]').setValue('Password1!')
    const btn = wrapper.find('button.btn-login')
    expect(btn.attributes('disabled')).toBeUndefined()
  })

  it('8 — le bouton est désactivé si auth.loading est true', async () => {
    const { wrapper } = mountLogin({ loading: true })
    await wrapper.find('input[type="email"]').setValue('alice@test.com')
    await wrapper.find('input[type="password"]').setValue('Password1!')
    const btn = wrapper.find('button.btn-login')
    expect(btn.attributes('disabled')).toBeDefined()
  })

  // ── Validation ──────────────────────────────────────────────────────────────

  it('9 — email invalide bloque le submit et affiche une erreur', async () => {
    const { wrapper, mockStore } = mountLogin()
    await wrapper.find('input[type="email"]').setValue('pasunemail')
    await wrapper.find('input[type="password"]').setValue('Password1!')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(mockStore.login).not.toHaveBeenCalled()
  })

  it('10 — mot de passe trop faible bloque le submit', async () => {
    const { wrapper, mockStore } = mountLogin()
    await wrapper.find('input[type="email"]').setValue('alice@test.com')
    await wrapper.find('input[type="password"]').setValue('simple')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(mockStore.login).not.toHaveBeenCalled()
  })

  it('11 — mot de passe fort (8 car, maj, min, chiffre, symbole) passe la validation', async () => {
    const { wrapper, mockStore } = mountLogin()
    mockStore.login.mockResolvedValue(true)
    await wrapper.find('input[type="email"]').setValue('alice@test.com')
    await wrapper.find('input[type="password"]').setValue('Password1!')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(mockStore.login).toHaveBeenCalled()
  })

  // ── Erreur store ────────────────────────────────────────────────────────────

  it('12 — affiche le message d\'erreur générique si auth.error est défini', () => {
    const { wrapper } = mountLogin({ error: 'Identifiants invalides' })
    expect(wrapper.find('.error').text()).toBe('Email ou mot de passe invalide')
  })

  it('13 — n\'affiche pas de message d\'erreur si auth.error est null', () => {
    const { wrapper } = mountLogin({ error: null })
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  // ── Tentatives & verrouillage ───────────────────────────────────────────────

  it('14 — après 3 échecs le bouton se désactive (lock)', async () => {
    const { wrapper, mockStore } = mountLogin()
    mockStore.login.mockResolvedValue(false)

    for (let i = 0; i < 3; i++) {
      await wrapper.find('input[type="email"]').setValue('alice@test.com')
      await wrapper.find('input[type="password"]').setValue('Password1!')
      await wrapper.find('form').trigger('submit')
      await flushPromises()
    }

    await wrapper.vm.$nextTick()

    expect(mockStore.login).toHaveBeenCalledTimes(3)
  })

  // ── Texte bouton ────────────────────────────────────────────────────────────

  it('15 — le bouton affiche "Connexion..." quand auth.loading est true', () => {
    const { wrapper } = mountLogin({ loading: true })
    expect(wrapper.find('button.btn-login').text()).toContain('Connexion...')
  })
})

// ════════════════════════════════════════════════════════════════════════════
// TESTS D'INTÉGRATION
// ════════════════════════════════════════════════════════════════════════════
describe("LoginView — Tests d'Intégration", () => {

  beforeEach(async () => {
    setActivePinia(createPinia())
    await router.push('/login')
    await router.isReady()
    vi.clearAllMocks()
  })

  it('16 — login réussi : login appelé avec email normalisé et mot de passe', async () => {
    const { wrapper, mockStore } = mountLogin()
    mockStore.login.mockResolvedValue(true)

    await wrapper.find('input[type="email"]').setValue('  Alice@Test.COM  ')
    await wrapper.find('input[type="password"]').setValue('Password1!')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(mockStore.login).toHaveBeenCalledWith('alice@test.com', 'Password1!', false)
  })

  it('17 — login réussi : redirige vers "/dashboard"', async () => {
    const { wrapper, mockStore } = mountLogin()
    mockStore.login.mockResolvedValue(true)

    await wrapper.find('input[type="email"]').setValue('alice@test.com')
    await wrapper.find('input[type="password"]').setValue('Password1!')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('18 — login échoué : reste sur /login, pas de redirection', async () => {
    await router.push('/login')
    const { wrapper, mockStore } = mountLogin()
    mockStore.login.mockResolvedValue(false)

    await wrapper.find('input[type="email"]').setValue('alice@test.com')
    await wrapper.find('input[type="password"]').setValue('Password1!')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('19 — login échoué : affiche un message d\'erreur générique', async () => {
    const { wrapper, mockStore } = mountLogin({ error: 'Email ou mot de passe invalide' })
    mockStore.login.mockResolvedValue(false)

    await wrapper.find('input[type="email"]').setValue('alice@test.com')
    await wrapper.find('input[type="password"]').setValue('Password1!')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('.error').exists()).toBe(true)
  })

  it('20 — remember me : login appelé avec email et mot de passe (remember géré côté store)', async () => {
    const { wrapper, mockStore } = mountLogin()
    mockStore.login.mockResolvedValue(true)

    await wrapper.find('input[type="email"]').setValue('alice@test.com')
    await wrapper.find('input[type="password"]').setValue('Password1!')
    await wrapper.find('input[type="checkbox"]').setValue(true)
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(mockStore.login).toHaveBeenCalledWith('alice@test.com', 'Password1!', true)
  })
})
