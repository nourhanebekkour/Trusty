import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mock api ───────────────────────────────────────────────
vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

import api from '@/services/api'

import {
  login,
  register,
  getProfile,
  getAllUsers,
  updateProfile,
  patchProfile,
  deleteUser,
} from '@/services/authservices'

// ═════════════════════════════════════════════════════════════
// TESTS UNITAIRES — authservices
// ═════════════════════════════════════════════════════════════

describe('authservices.js — Tests Unitaires', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── LOGIN ────────────────────────────────────────────────

  it('1 — login appelle POST /auth/login avec credentials', async () => {
    const credentials = {
      email: 'test@mail.com',
      password: '123456',
    }

    api.post.mockResolvedValue({
      data: { token: 'abc123' },
    })

    const response = await login(credentials)

    expect(api.post).toHaveBeenCalledWith(
      '/auth/login',
      credentials
    )

    expect(response.data.token).toBe('abc123')
  })

  // ── REGISTER ─────────────────────────────────────────────

  it('2 — register appelle POST /auth/register avec userData', async () => {
    const userData = {
      name: 'Fatine',
      email: 'fatine@mail.com',
      password: '123456',
    }

    api.post.mockResolvedValue({
      data: { success: true },
    })

    const response = await register(userData)

    expect(api.post).toHaveBeenCalledWith(
      '/auth/register',
      userData
    )

    expect(response.data.success).toBe(true)
  })

  // ── GET PROFILE ──────────────────────────────────────────

  it('3 — getProfile appelle GET /auth/profile', async () => {
    api.get.mockResolvedValue({
      data: { nom: 'Ahmed' },
    })

    const response = await getProfile()

    expect(api.get).toHaveBeenCalledWith(
      '/auth/profile'
    )

    expect(response.data.nom).toBe('Ahmed')
  })

  // ── GET USERS ────────────────────────────────────────────

  it('4 — getAllUsers appelle GET /users', async () => {
    api.get.mockResolvedValue({
      data: [],
    })

    await getAllUsers()

    expect(api.get).toHaveBeenCalledWith(
      '/users'
    )
  })

  // ── UPDATE PROFILE ───────────────────────────────────────

  it('5 — updateProfile appelle PUT /users/:id', async () => {
    const id = 'u1'

    const data = {
      nom: 'Sara',
    }

    api.put.mockResolvedValue({
      data,
    })

    const response = await updateProfile(id, data)

    expect(api.put).toHaveBeenCalledWith(
      '/users/u1',
      data
    )

    expect(response.data.nom).toBe('Sara')
  })

  // ── PATCH PROFILE ────────────────────────────────────────

  it('6 — patchProfile appelle PATCH /users/:id', async () => {
    const id = 'u2'

    const data = {
      telephone: '+212600000000',
    }

    api.patch.mockResolvedValue({
      data,
    })

    const response = await patchProfile(id, data)

    expect(api.patch).toHaveBeenCalledWith(
      '/users/u2',
      data
    )

    expect(response.data.telephone).toBe(
      '+212600000000'
    )
  })

  // ── DELETE USER ──────────────────────────────────────────

  it('7 — deleteUser appelle DELETE /users/:id', async () => {
    api.delete.mockResolvedValue({
      data: { success: true },
    })

    const response = await deleteUser('u5')

    expect(api.delete).toHaveBeenCalledWith(
      '/users/u5'
    )

    expect(response.data.success).toBe(true)
  })
})


// ═════════════════════════════════════════════════════════════
// TESTS D’INTÉGRATION — authservices
// ═════════════════════════════════════════════════════════════

describe('authservices.js — Tests d’intégration', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('8 — workflow login retourne correctement le token', async () => {
    api.post.mockResolvedValue({
      data: {
        token: 'jwt-token',
        user: {
          id: 'u1',
          nom: 'Fatine',
        },
      },
    })

    const response = await login({
      email: 'fatine@mail.com',
      password: '123456',
    })

    expect(response.data.token).toBe(
      'jwt-token'
    )

    expect(response.data.user.nom).toBe(
      'Fatine'
    )
  })

  it('9 — updateProfile puis récupération profil fonctionne', async () => {

    api.put.mockResolvedValue({
      data: {
        nom: 'Updated User',
      },
    })

    api.get.mockResolvedValue({
      data: {
        nom: 'Updated User',
      },
    })

    await updateProfile('u1', {
      nom: 'Updated User',
    })

    const profile = await getProfile()

    expect(profile.data.nom).toBe(
      'Updated User'
    )
  })

  it('10 — patchProfile gère les modifications partielles', async () => {

    api.patch.mockResolvedValue({
      data: {
        ville: 'Tanger',
      },
    })

    const response = await patchProfile('u1', {
      ville: 'Tanger',
    })

    expect(response.data.ville).toBe(
      'Tanger'
    )
  })

  it('11 — deleteUser retourne success=true après suppression', async () => {

    api.delete.mockResolvedValue({
      data: {
        success: true,
      },
    })

    const response = await deleteUser('u1')

    expect(response.data.success).toBe(true)
  })
})