import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// ── Mock api uniquement (frontière HTTP) ─────────────────────────────────────
// authService N'EST PAS mocké : on utilise le vrai module.
// C'est l'équivalent des tests backend integration/ qui utilisent la vraie DB
// sans mocker la couche service.
vi.mock('@/api', () => ({
  default: {
    get:  vi.fn(),
    post: vi.fn(),
  },
}))

import api from '@/api'
import { useAuthStore } from '@/stores/authstore'

// ═════════════════════════════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — authStore + authService (réel) + api (mockée)
//
// Principe :
//   - authStore appelle le VRAI authService (pas de vi.mock sur le service)
//   - authService appelle api (mockée à la frontière HTTP)
//   - On teste que la chaîne complète store → service → api fonctionne
//
// Analogie backend :
//   - backend unit :       controller  →  mock(service)
//   - backend unit :       service     →  mock(prisma)
//   - backend integration: route → vrai service → vraie DB
//   - frontend unit :      store  →  mock(service)
//   - frontend unit :      service → mock(api)
//   - frontend integration: store → vrai service → mock(api)  ← ce fichier
// ═════════════════════════════════════════════════════════════════════════════

describe("authStore + authService — Tests d'intégration", () => {

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // ── login ──────────────────────────────────────────────────────────────────

  it('1 — login réussi : store → service → api.post /auth/login → api.get /auth/me → user mis à jour', async () => {
    api.post.mockResolvedValue({ data: {} })
    api.get.mockResolvedValue({ data: { data: { id_utilisateur: 'u1', nom: 'Alice', email: 'alice@test.com' } } })

    const store = useAuthStore()
    const result = await store.login('alice@test.com', '1234')

    expect(result).toBe(true)
    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'alice@test.com',
      password: '1234',
      remember: false,
    })
    expect(api.get).toHaveBeenCalledWith('/auth/me')
    expect(store.user).not.toBeNull()
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('2 — login échoue : erreur API propagée jusqu\'au store', async () => {
    api.post.mockRejectedValue({ response: { data: { message: 'Identifiants invalides' } } })

    const store = useAuthStore()
    const result = await store.login('wrong@test.com', 'wrong')

    expect(result).toBe(false)
    expect(store.user).toBeNull()
    expect(store.error).toBe('Identifiants invalides')
    expect(store.loading).toBe(false)
    expect(api.get).not.toHaveBeenCalled()
  })

  it('3 — login échoue sans message serveur : fallback générique', async () => {
    api.post.mockRejectedValue(new Error('Network error'))

    const store = useAuthStore()
    await store.login('x@x.com', 'pass')

    expect(store.error).toBe('Erreur connexion')
  })

  // ── login → logout ─────────────────────────────────────────────────────────

  it('4 — login puis logout : store → service → api.post /auth/logout → user null', async () => {
    api.post
      .mockResolvedValueOnce({ data: {} })  // login
      .mockResolvedValueOnce({})             // logout
    api.get.mockResolvedValue({ data: { data: { nom: 'Alice' } } })

    const store = useAuthStore()
    await store.login('alice@test.com', '1234')
    expect(store.user).not.toBeNull()

    await store.logout()

    expect(api.post).toHaveBeenCalledWith('/auth/logout')
    expect(store.user).toBeNull()
  })

  it('5 — logout silencieux si api.post échoue : user null quand même', async () => {
    api.post
      .mockResolvedValueOnce({ data: {} })   // login
      .mockRejectedValueOnce(new Error('Network error'))  // logout
    api.get.mockResolvedValue({ data: { data: { nom: 'Alice' } } })

    const store = useAuthStore()
    await store.login('alice@test.com', '1234')
    await store.logout()

    expect(store.user).toBeNull()
  })

  // ── fetchUser ──────────────────────────────────────────────────────────────

  it('6 — fetchUser : store → service.getMe → api.get /auth/me → user mis à jour', async () => {
    api.get.mockResolvedValue({ data: { data: { nom: 'Bob', email: 'bob@test.com', role: 'ETUDIANT' } } })

    const store = useAuthStore()
    await store.fetchUser()

    expect(api.get).toHaveBeenCalledWith('/auth/me')
    expect(store.user).not.toBeNull()
  })

  it('7 — fetchUser échoue : user reste null, pas d\'erreur levée', async () => {
    api.get.mockRejectedValue(new Error('Unauthorized'))

    const store = useAuthStore()
    await store.fetchUser()

    expect(store.user).toBeNull()
  })

  // ── register ───────────────────────────────────────────────────────────────

  it('8 — register : store → service.register → api.post /auth/register', async () => {
    api.post.mockResolvedValue({ data: { success: true } })

    const store = useAuthStore()
    const result = await store.register({ email: 'new@test.com', password: '1234', nom: 'Test' })

    expect(result).toBe(true)
    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      email: 'new@test.com', password: '1234', nom: 'Test',
    })
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('9 — register échoue : erreur propagée jusqu\'au store', async () => {
    api.post.mockRejectedValue({ response: { data: { message: 'Email déjà utilisé' } } })

    const store = useAuthStore()
    const result = await store.register({ email: 'dup@test.com', password: '1234' })

    expect(result).toBe(false)
    expect(store.error).toBe('Email déjà utilisé')
  })

  // ── scénario complet ───────────────────────────────────────────────────────

  it('10 — échec login puis succès : error effacée, user mis à jour', async () => {
    api.post
      .mockRejectedValueOnce({ response: { data: { message: 'Identifiants invalides' } } })
      .mockResolvedValueOnce({ data: {} })
    api.get.mockResolvedValue({ data: { data: { nom: 'Alice' } } })

    const store = useAuthStore()

    await store.login('wrong@test.com', 'wrong')
    expect(store.error).toBe('Identifiants invalides')

    await store.login('alice@test.com', '1234')
    expect(store.error).toBeNull()
    expect(store.user).not.toBeNull()
  })
})
