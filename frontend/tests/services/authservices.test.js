import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock api ─────────────────────────────────────────────────────────────────
// api est la frontière HTTP : toujours mockée en tests unitaires.
// auth.service.js importe '../api.js' → src/api.js (@/api)
vi.mock('@/api', () => ({
  default: {
    post: vi.fn(),
    get:  vi.fn(),
  },
}))

import api from '@/api'
import { authService } from '@/services/auth.service'

// ═════════════════════════════════════════════════════════════════════════════
// TESTS UNITAIRES — auth.service
// Principe : chaque fonction du service est testée en isolation complète.
// On vérifie : (1) l'endpoint appelé, (2) les paramètres, (3) la valeur retournée,
//              (4) la propagation des erreurs.
// ═════════════════════════════════════════════════════════════════════════════

describe('auth.service.js — Tests Unitaires', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── login ──────────────────────────────────────────────────────────────────

  it('1 — login appelle POST /auth/login avec credentials', async () => {
    const credentials = { email: 'test@mail.com', password: '123456' }
    api.post.mockResolvedValue({ data: { token: 'abc123' } })

    await authService.login(credentials)

    expect(api.post).toHaveBeenCalledWith('/auth/login', credentials)
  })

  it('2 — login retourne response.data', async () => {
    api.post.mockResolvedValue({ data: { token: 'jwt-token', user: { id: 'u1', nom: 'Fatine' } } })

    const result = await authService.login({ email: 'fatine@mail.com', password: '123456' })

    expect(result.token).toBe('jwt-token')
    expect(result.user.nom).toBe('Fatine')
  })

  it('3 — login propage l\'erreur si api.post échoue', async () => {
    api.post.mockRejectedValue(new Error('Network Error'))

    await expect(authService.login({ email: 'x@x.com', password: 'pass' }))
      .rejects.toThrow('Network Error')
  })

  // ── register ───────────────────────────────────────────────────────────────

  it('4 — register appelle POST /auth/register avec userData', async () => {
    const userData = { prenom: 'Fatine', email: 'fatine@mail.com', password: '123456' }
    api.post.mockResolvedValue({ data: { success: true } })

    await authService.register(userData)

    expect(api.post).toHaveBeenCalledWith('/auth/register', userData)
  })

  it('5 — register retourne response.data', async () => {
    api.post.mockResolvedValue({ data: { success: true } })

    const result = await authService.register({ email: 'fatine@mail.com', password: '123456' })

    expect(result.success).toBe(true)
  })

  it('6 — register propage l\'erreur si api.post échoue', async () => {
    api.post.mockRejectedValue(new Error('Network Error'))

    await expect(authService.register({ email: 'x@x.com', password: 'pass' }))
      .rejects.toThrow('Network Error')
  })

  // ── getMe ──────────────────────────────────────────────────────────────────

  it('7 — getMe appelle GET /auth/me', async () => {
    api.get.mockResolvedValue({ data: { data: { nom: 'Ahmed' } } })

    await authService.getMe()

    expect(api.get).toHaveBeenCalledWith('/auth/me')
  })

  it('8 — getMe retourne response.data (l\'objet complet de réponse)', async () => {
    api.get.mockResolvedValue({ data: { data: { nom: 'Ahmed', email: 'ahmed@test.ma' } } })

    const result = await authService.getMe()

    expect(result.data.nom).toBe('Ahmed')
    expect(result.data.email).toBe('ahmed@test.ma')
  })

  // ── forgotPassword ─────────────────────────────────────────────────────────

  it('9 — forgotPassword appelle POST /auth/forgot-password avec email', async () => {
    api.post.mockResolvedValue({ data: { success: true } })

    await authService.forgotPassword('test@mail.com')

    expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'test@mail.com' })
  })

  it('10 — forgotPassword retourne response.data', async () => {
    api.post.mockResolvedValue({ data: { success: true } })

    const result = await authService.forgotPassword('test@mail.com')

    expect(result.success).toBe(true)
  })

  it('11 — forgotPassword propage l\'erreur si api.post échoue', async () => {
    api.post.mockRejectedValue(new Error('Network Error'))

    await expect(authService.forgotPassword('x@x.com'))
      .rejects.toThrow('Network Error')
  })

  // ── resetPassword ──────────────────────────────────────────────────────────

  it('12 — resetPassword appelle POST /auth/reset-password avec token et nouveau mot de passe', async () => {
    api.post.mockResolvedValue({ data: { success: true } })

    await authService.resetPassword('tok123', 'NouveauMdp1!')

    expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
      token: 'tok123',
      nouveauMotDePasse: 'NouveauMdp1!',
    })
  })

  it('13 — resetPassword retourne response.data', async () => {
    api.post.mockResolvedValue({ data: { success: true } })

    const result = await authService.resetPassword('tok123', 'NouveauMdp1!')

    expect(result.success).toBe(true)
  })
})
