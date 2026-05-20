import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
<<<<<<< HEAD:frontend/tests/authstore.test.js
import { useAuthStore } from '../src/stores/auth'
=======
import { useAuthStore } from '../../src/stores/authstore'
>>>>>>> d8683d494edc716797f461648f2c60f062f8a2ef:frontend/tests/stores/authstore.test.js

// ─── Mock du service auth ─────────────────────────────────────────────────────
// ✅
vi.mock('../../src/services/authservices', () => ({
  login: vi.fn(),
  getProfile: vi.fn(),
}))

<<<<<<< HEAD:frontend/tests/authstore.test.js
import { login, getProfile } from '../src/services/auth.service.jgrs'
=======
import { login, getProfile } from '../../src/services/authservices'
>>>>>>> d8683d494edc716797f461648f2c60f062f8a2ef:frontend/tests/stores/authstore.test.js

// ─── Mock localStorage ────────────────────────────────────────────────────────
const localStorageMock = (() => {
  let store = {}
  return {
    getItem:    (key)        => store[key] ?? null,
    setItem:    (key, value) => { store[key] = String(value) },
    removeItem: (key)        => { delete store[key] },
    clear:      ()           => { store = {} },
  }
})()
Object.defineProperty(global, 'localStorage', { value: localStorageMock })

// ════════════════════════════════════════════════════════════════════════════
// TESTS UNITAIRES
// ════════════════════════════════════════════════════════════════════════════
describe('authStore — Tests Unitaires', () => {

  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  // ── État initial ────────────────────────────────────────────────────────────

  it('1 — état initial : user null, token null, loading false, error null', () => {
    const store = useAuthStore()
    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('2 — état initial : token récupéré depuis localStorage si présent', () => {
    localStorage.setItem('token', 'token-existant')
    const store = useAuthStore()
    expect(store.token).toBe('token-existant')
  })

  // ── loginUser (succès) ──────────────────────────────────────────────────────

  it('3 — loginUser : token sauvegardé dans le state et localStorage', async () => {
    login.mockResolvedValue({
      data: { token: 'abc123', user: { id: 1, name: 'Alice' } },
    })
    const store = useAuthStore()
    await store.loginUser({ email: 'alice@test.com', password: '1234' })

    expect(store.token).toBe('abc123')
    expect(localStorage.getItem('token')).toBe('abc123')
  })

  it('4 — loginUser : user sauvegardé dans le state', async () => {
    login.mockResolvedValue({
      data: { token: 'abc123', user: { id: 1, name: 'Alice' } },
    })
    const store = useAuthStore()
    await store.loginUser({ email: 'alice@test.com', password: '1234' })

    expect(store.user).toEqual({ id: 1, name: 'Alice' })
  })

  it('5 — loginUser : loading passe à false après succès', async () => {
    login.mockResolvedValue({
      data: { token: 'abc123', user: { id: 1, name: 'Alice' } },
    })
    const store = useAuthStore()
    await store.loginUser({ email: 'alice@test.com', password: '1234' })

    expect(store.loading).toBe(false)
  })

  it('6 — loginUser : error reste null après succès', async () => {
    login.mockResolvedValue({
      data: { token: 'abc123', user: { id: 1, name: 'Alice' } },
    })
    const store = useAuthStore()
    await store.loginUser({ email: 'alice@test.com', password: '1234' })

    expect(store.error).toBeNull()
  })

  // ── loginUser (échec) ───────────────────────────────────────────────────────

  it('7 — loginUser : error set avec message du serveur si échec', async () => {
    login.mockRejectedValue({
      response: { data: { message: 'Identifiants invalides' } },
    })
    const store = useAuthStore()
    await store.loginUser({ email: 'wrong@test.com', password: 'wrong' })

    expect(store.error).toBe('Identifiants invalides')
  })

  it('8 — loginUser : error fallback générique si pas de message serveur', async () => {
    login.mockRejectedValue({})
    const store = useAuthStore()
    await store.loginUser({ email: 'wrong@test.com', password: 'wrong' })

    expect(store.error).toBe('Erreur de connexion')
  })

  it('9 — loginUser : loading passe à false même après une erreur', async () => {
    login.mockRejectedValue({ response: { data: { message: 'Erreur' } } })
    const store = useAuthStore()
    await store.loginUser({ email: 'wrong@test.com', password: 'wrong' })

    expect(store.loading).toBe(false)
  })

  it('10 — loginUser : token et user restent null après échec', async () => {
    login.mockRejectedValue({ response: { data: { message: 'Erreur' } } })
    const store = useAuthStore()
    await store.loginUser({ email: 'wrong@test.com', password: 'wrong' })

    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
  })

  // ── logout ──────────────────────────────────────────────────────────────────

  it('11 — logout : remet user et token à null', async () => {
    login.mockResolvedValue({
      data: { token: 'abc123', user: { id: 1, name: 'Alice' } },
    })
    const store = useAuthStore()
    await store.loginUser({ email: 'alice@test.com', password: '1234' })
    store.logout()

    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
  })

  it('12 — logout : supprime le token du localStorage', async () => {
    login.mockResolvedValue({
      data: { token: 'abc123', user: { id: 1, name: 'Alice' } },
    })
    const store = useAuthStore()
    await store.loginUser({ email: 'alice@test.com', password: '1234' })
    store.logout()

    expect(localStorage.getItem('token')).toBeNull()
  })

  // ── fetchProfile ────────────────────────────────────────────────────────────

  it('13 — fetchProfile : met à jour user avec les données reçues', async () => {
    getProfile.mockResolvedValue({ data: { id: 1, name: 'Alice', email: 'alice@test.com' } })
    const store = useAuthStore()
    await store.fetchProfile()

    expect(store.user).toEqual({ id: 1, name: 'Alice', email: 'alice@test.com' })
  })

  it('14 — fetchProfile : ne plante pas si le service échoue', async () => {
    getProfile.mockRejectedValue(new Error('Network error'))
    const store = useAuthStore()

    await expect(store.fetchProfile()).resolves.not.toThrow()
  })
})

// ════════════════════════════════════════════════════════════════════════════
// TESTS D'INTÉGRATION
// ════════════════════════════════════════════════════════════════════════════
describe("authStore — Tests d'Intégration", () => {

  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('15 — login puis logout : état complètement réinitialisé', async () => {
    login.mockResolvedValue({
      data: { token: 'abc123', user: { id: 1, name: 'Alice' } },
    })
    const store = useAuthStore()

    await store.loginUser({ email: 'alice@test.com', password: '1234' })
    expect(store.token).toBe('abc123')
    expect(store.user).not.toBeNull()

    store.logout()
    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('16 — login puis fetchProfile : user mis à jour avec données complètes', async () => {
    login.mockResolvedValue({
      data: { token: 'abc123', user: { id: 1, name: 'Alice' } },
    })
    getProfile.mockResolvedValue({
      data: { id: 1, name: 'Alice', email: 'alice@test.com', role: 'admin' },
    })
    const store = useAuthStore()

    await store.loginUser({ email: 'alice@test.com', password: '1234' })
    await store.fetchProfile()

    expect(store.user).toEqual({ id: 1, name: 'Alice', email: 'alice@test.com', role: 'admin' })
    expect(store.token).toBe('abc123')
  })

  it('17 — deux tentatives login : la deuxième écrase la première', async () => {
    login
      .mockResolvedValueOnce({ data: { token: 'token-1', user: { id: 1, name: 'Alice' } } })
      .mockResolvedValueOnce({ data: { token: 'token-2', user: { id: 2, name: 'Bob' } } })

    const store = useAuthStore()

    await store.loginUser({ email: 'alice@test.com', password: '1234' })
    await store.loginUser({ email: 'bob@test.com', password: '5678' })

    expect(store.token).toBe('token-2')
    expect(store.user.name).toBe('Bob')
    expect(localStorage.getItem('token')).toBe('token-2')
  })

  it('18 — échec login : error effacée au prochain essai réussi', async () => {
    login
      .mockRejectedValueOnce({ response: { data: { message: 'Identifiants invalides' } } })
      .mockResolvedValueOnce({ data: { token: 'abc123', user: { id: 1, name: 'Alice' } } })

    const store = useAuthStore()

    await store.loginUser({ email: 'wrong@test.com', password: 'wrong' })
    expect(store.error).toBe('Identifiants invalides')

    await store.loginUser({ email: 'alice@test.com', password: '1234' })
    expect(store.error).toBeNull()
    expect(store.token).toBe('abc123')
  })
})