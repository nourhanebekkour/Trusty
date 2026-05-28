import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mock api ───────────────────────────────────────────────
vi.mock('@/api', () => ({
  default: {
    post: vi.fn(),
    get:  vi.fn(),
  },
}))

import api from '@/api'
import { authService } from '@/services/auth.service'

// ═════════════════════════════════════════════════════════════
// TESTS UNITAIRES — auth.service
// ═════════════════════════════════════════════════════════════

describe('auth.service.js — Tests Unitaires', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── LOGIN ────────────────────────────────────────────────

  it('1 — login appelle POST /auth/login avec credentials', async () => {
    const credentials = { email: 'test@mail.com', password: '123456' }
    api.post.mockResolvedValue({ data: { token: 'abc123' } })

    const result = await authService.login(credentials)

    expect(api.post).toHaveBeenCalledWith('/auth/login', credentials)
    expect(result.token).toBe('abc123')
  })

  // ── REGISTER ─────────────────────────────────────────────

  it('2 — register appelle POST /auth/register avec userData', async () => {
    const userData = { prenom: 'Fatine', email: 'fatine@mail.com', password: '123456' }
    api.post.mockResolvedValue({ data: { success: true } })

    const result = await authService.register(userData)

    expect(api.post).toHaveBeenCalledWith('/auth/register', userData)
    expect(result.success).toBe(true)
  })

  // ── GET ME ──────────────────────────────────────────────

  it('3 — getMe appelle GET /auth/me', async () => {
    api.get.mockResolvedValue({ data: { data: { nom: 'Ahmed' } } })

    const result = await authService.getMe()

    expect(api.get).toHaveBeenCalledWith('/auth/me')
    expect(result.data.nom).toBe('Ahmed')
  })

  // ── FORGOT PASSWORD ──────────────────────────────────────

  it('4 — forgotPassword appelle POST /auth/forgot-password avec email', async () => {
    api.post.mockResolvedValue({ data: { success: true } })

    const result = await authService.forgotPassword('test@mail.com')

    expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'test@mail.com' })
    expect(result.success).toBe(true)
  })

  // ── RESET PASSWORD ───────────────────────────────────────

  it('5 — resetPassword appelle POST /auth/reset-password avec token et nouveau mot de passe', async () => {
    api.post.mockResolvedValue({ data: { success: true } })

    const result = await authService.resetPassword('tok123', 'NouveauMdp1!')

    expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
      token: 'tok123',
      nouveauMotDePasse: 'NouveauMdp1!',
    })
    expect(result.success).toBe(true)
  })
})

// ═════════════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — auth.service
// ═════════════════════════════════════════════════════════════

describe("auth.service.js — Tests d'intégration", () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('6 — workflow login retourne correctement les données utilisateur', async () => {
    api.post.mockResolvedValue({
      data: { token: 'jwt-token', user: { id: 'u1', nom: 'Fatine' } },
    })

    const result = await authService.login({ email: 'fatine@mail.com', password: '123456' })

    expect(result.token).toBe('jwt-token')
    expect(result.user.nom).toBe('Fatine')
  })

  it('7 — getMe retourne les données du profil connecté', async () => {
    api.get.mockResolvedValue({
      data: { data: { nom: 'Ahmed', email: 'ahmed@test.ma' } },
    })

    const result = await authService.getMe()

    expect(result.data.nom).toBe('Ahmed')
    expect(result.data.email).toBe('ahmed@test.ma')
  })

  it('8 — login propage l\'erreur si api.post échoue', async () => {
    api.post.mockRejectedValue(new Error('Network Error'))

    await expect(authService.login({ email: 'x@x.com', password: 'pass' })).rejects.toThrow('Network Error')
  })

  it('9 — register propage l\'erreur si api.post échoue', async () => {
    api.post.mockRejectedValue(new Error('Network Error'))

    await expect(authService.register({ email: 'x@x.com', password: 'pass' })).rejects.toThrow('Network Error')
  })

  it('10 — forgotPassword propage l\'erreur si api.post échoue', async () => {
    api.post.mockRejectedValue(new Error('Network Error'))

    await expect(authService.forgotPassword('x@x.com')).rejects.toThrow('Network Error')
  })
})
