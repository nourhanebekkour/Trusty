import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
<<<<<<< HEAD
import { useAuthStore } from '../../src/stores/authstore'
=======
>>>>>>> 9a228362e91466924d2b2fd34d9fa9cb2d0df88a

// ─── Mock du service auth ─────────────────────────────────────────────────────
vi.mock('@/services/auth.service', () => ({
  authService: {
    login:    vi.fn(),
    register: vi.fn(),
    getMe:    vi.fn(),
  },
}))

<<<<<<< HEAD
import { login, getProfile } from '../../src/services/authservices'
=======
// ─── Mock de l'api (pour logout) ─────────────────────────────────────────────
vi.mock('@/api', () => ({
  default: { post: vi.fn() },
}))
>>>>>>> 9a228362e91466924d2b2fd34d9fa9cb2d0df88a

import { authService } from '@/services/auth.service'
import api from '@/api'
import { useAuthStore } from '@/stores/authstore'

// ════════════════════════════════════════════════════════════════════════════
// TESTS UNITAIRES
// ════════════════════════════════════════════════════════════════════════════
describe('authStore — Tests Unitaires', () => {

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // ── État initial ────────────────────────────────────────────────────────────

  it('1 — état initial : user null, loading false, error null', () => {
    const store = useAuthStore()
    expect(store.user).toBeNull()
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  // ── login (succès) ──────────────────────────────────────────────────────────

  it('2 — login : appelle authService.login avec email et password en objet', async () => {
    authService.login.mockResolvedValue({})
    authService.getMe.mockResolvedValue({ data: { nom: 'Alice' } })
    const store = useAuthStore()

    await store.login('alice@test.com', '1234')

    expect(authService.login).toHaveBeenCalledWith({ email: 'alice@test.com', password: '1234' })
  })

  it('3 — login : user mis à jour via fetchUser après succès', async () => {
    authService.login.mockResolvedValue({})
    authService.getMe.mockResolvedValue({ data: { nom: 'Alice', email: 'alice@test.com' } })
    const store = useAuthStore()

    await store.login('alice@test.com', '1234')

    expect(store.user).toEqual({ nom: 'Alice', email: 'alice@test.com' })
  })

  it('4 — login : retourne true après succès', async () => {
    authService.login.mockResolvedValue({})
    authService.getMe.mockResolvedValue({ data: { nom: 'Alice' } })
    const store = useAuthStore()

    const result = await store.login('alice@test.com', '1234')

    expect(result).toBe(true)
  })

  it('5 — login : loading passe à false après succès', async () => {
    authService.login.mockResolvedValue({})
    authService.getMe.mockResolvedValue({ data: { nom: 'Alice' } })
    const store = useAuthStore()

    await store.login('alice@test.com', '1234')

    expect(store.loading).toBe(false)
  })

  it('6 — login : error reste null après succès', async () => {
    authService.login.mockResolvedValue({})
    authService.getMe.mockResolvedValue({ data: { nom: 'Alice' } })
    const store = useAuthStore()

    await store.login('alice@test.com', '1234')

    expect(store.error).toBeNull()
  })

  // ── login (échec) ───────────────────────────────────────────────────────────

  it('7 — login : error set avec message du serveur si échec', async () => {
    authService.login.mockRejectedValue({
      response: { data: { message: 'Identifiants invalides' } },
    })
    const store = useAuthStore()

    await store.login('wrong@test.com', 'wrong')

    expect(store.error).toBe('Identifiants invalides')
  })

  it('8 — login : error fallback générique si pas de message serveur', async () => {
    authService.login.mockRejectedValue({})
    const store = useAuthStore()

    await store.login('wrong@test.com', 'wrong')

    expect(store.error).toBe('Erreur connexion')
  })

  it('9 — login : retourne false après échec', async () => {
    authService.login.mockRejectedValue({ response: { data: { message: 'Erreur' } } })
    const store = useAuthStore()

    const result = await store.login('wrong@test.com', 'wrong')

    expect(result).toBe(false)
  })

  it('10 — login : loading passe à false même après une erreur', async () => {
    authService.login.mockRejectedValue({ response: { data: { message: 'Erreur' } } })
    const store = useAuthStore()

    await store.login('wrong@test.com', 'wrong')

    expect(store.loading).toBe(false)
  })

  it('11 — login : user reste null après échec', async () => {
    authService.login.mockRejectedValue({ response: { data: { message: 'Erreur' } } })
    const store = useAuthStore()

    await store.login('wrong@test.com', 'wrong')

    expect(store.user).toBeNull()
  })

  // ── logout ──────────────────────────────────────────────────────────────────

  it('12 — logout : appelle api.post /auth/logout', async () => {
    api.post.mockResolvedValue({})
    const store = useAuthStore()

    await store.logout()

    expect(api.post).toHaveBeenCalledWith('/auth/logout')
  })

  it('13 — logout : remet user à null', async () => {
    authService.login.mockResolvedValue({})
    authService.getMe.mockResolvedValue({ data: { nom: 'Alice' } })
    api.post.mockResolvedValue({})
    const store = useAuthStore()

    await store.login('alice@test.com', '1234')
    expect(store.user).not.toBeNull()

    await store.logout()

    expect(store.user).toBeNull()
  })

  it('14 — logout : ne plante pas si api.post échoue', async () => {
    api.post.mockRejectedValue(new Error('Network error'))
    const store = useAuthStore()

    await expect(store.logout()).resolves.not.toThrow()
    expect(store.user).toBeNull()
  })

  // ── fetchUser ───────────────────────────────────────────────────────────────

  it('15 — fetchUser : met à jour user avec les données reçues', async () => {
    authService.getMe.mockResolvedValue({ data: { nom: 'Alice', email: 'alice@test.com' } })
    const store = useAuthStore()

    await store.fetchUser()

    expect(store.user).toEqual({ nom: 'Alice', email: 'alice@test.com' })
  })

  it('16 — fetchUser : user mis à null si getMe échoue', async () => {
    authService.getMe.mockRejectedValue(new Error('Network error'))
    const store = useAuthStore()

    await store.fetchUser()

    expect(store.user).toBeNull()
  })

  it('17 — fetchUser : ne rejette pas si getMe échoue', async () => {
    authService.getMe.mockRejectedValue(new Error('Network error'))
    const store = useAuthStore()

    await expect(store.fetchUser()).resolves.not.toThrow()
  })
})

// ════════════════════════════════════════════════════════════════════════════
// TESTS D'INTÉGRATION
// ════════════════════════════════════════════════════════════════════════════
describe("authStore — Tests d'Intégration", () => {

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('18 — login puis logout : user réinitialisé à null', async () => {
    authService.login.mockResolvedValue({})
    authService.getMe.mockResolvedValue({ data: { nom: 'Alice' } })
    api.post.mockResolvedValue({})
    const store = useAuthStore()

    await store.login('alice@test.com', '1234')
    expect(store.user).not.toBeNull()

    await store.logout()
    expect(store.user).toBeNull()
  })

  it('19 — login puis fetchUser : user mis à jour avec données complètes', async () => {
    authService.login.mockResolvedValue({})
    authService.getMe
      .mockResolvedValueOnce({ data: { nom: 'Alice' } })
      .mockResolvedValueOnce({ data: { nom: 'Alice', email: 'alice@test.com', role: 'ETUDIANT' } })
    const store = useAuthStore()

    await store.login('alice@test.com', '1234')
    await store.fetchUser()

    expect(store.user).toEqual({ nom: 'Alice', email: 'alice@test.com', role: 'ETUDIANT' })
  })

  it('20 — deux tentatives login : la deuxième écrase la première', async () => {
    authService.login.mockResolvedValue({})
    authService.getMe
      .mockResolvedValueOnce({ data: { nom: 'Alice' } })
      .mockResolvedValueOnce({ data: { nom: 'Bob' } })
    const store = useAuthStore()

    await store.login('alice@test.com', '1234')
    await store.login('bob@test.com', '5678')

    expect(store.user.nom).toBe('Bob')
  })

  it('21 — échec login : error effacée au prochain essai réussi', async () => {
    authService.login
      .mockRejectedValueOnce({ response: { data: { message: 'Identifiants invalides' } } })
      .mockResolvedValueOnce({})
    authService.getMe.mockResolvedValue({ data: { nom: 'Alice' } })
    const store = useAuthStore()

    await store.login('wrong@test.com', 'wrong')
    expect(store.error).toBe('Identifiants invalides')

    await store.login('alice@test.com', '1234')
    expect(store.error).toBeNull()
    expect(store.user).not.toBeNull()
  })
})
