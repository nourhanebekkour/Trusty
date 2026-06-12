import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getProfessionalProfile,
  updateProfessionalProfile,
  getProfessionalNotifications,
  markProfessionalNotificationAsRead,
  createProfessionalRecommendation,
  getProfessionalInternships,
  getProfessionalProjects,
} from '@/services/professionalApi'

vi.mock('@/services/api', () => ({
  default: {
    get:    vi.fn(),
    post:   vi.fn(),
    put:    vi.fn(),
    delete: vi.fn(),
  }
}))

import api from '@/services/api'

beforeEach(() => vi.clearAllMocks())

describe('getProfessionalProfile()', () => {
  it('appelle GET /auth/me', async () => {
    api.get.mockResolvedValue({ data: { data: {} } })
    await getProfessionalProfile()
    expect(api.get).toHaveBeenCalledWith('/auth/me')
  })
})

describe('updateProfessionalProfile()', () => {
  it('appelle PUT /auth/me avec les données', async () => {
    api.put.mockResolvedValue({ data: { data: {} } })
    await updateProfessionalProfile({ nom: 'Martin' })
    expect(api.put).toHaveBeenCalledWith('/auth/me', { nom: 'Martin' })
  })
})

describe('getProfessionalNotifications()', () => {
  it('appelle GET /notifications/', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })
    await getProfessionalNotifications()
    expect(api.get).toHaveBeenCalledWith('/notifications/')
  })

  it('retourne un tableau de notifications mappées', async () => {
    api.get.mockResolvedValue({
      data: { data: [{ id_notification: 1, titre: 'Test', message: 'msg', est_lue: false, date_creation: '2026-01-01', type_notification: 'GENERAL' }] }
    })
    const result = await getProfessionalNotifications()
    expect(result.notifications).toHaveLength(1)
    expect(result.notifications[0]).toMatchObject({ id: 1, title: 'Test', isRead: false })
  })
})

describe('markProfessionalNotificationAsRead()', () => {
  it('appelle PUT /notifications/:id/lire', async () => {
    api.put.mockResolvedValue({})
    await markProfessionalNotificationAsRead(5)
    expect(api.put).toHaveBeenCalledWith('/notifications/5/lire')
  })
})

describe('createProfessionalRecommendation()', () => {
  it('appelle POST /recommandations/', async () => {
    api.post.mockResolvedValue({ data: { data: {} } })
    await createProfessionalRecommendation({ studentId: 3, message: 'Très bon' })
    expect(api.post).toHaveBeenCalledWith('/recommandations/', { id_etudiant: 3, message: 'Très bon' })
  })
})

describe('getProfessionalInternships()', () => {
  it('appelle GET /stages/', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })
    await getProfessionalInternships()
    expect(api.get).toHaveBeenCalledWith('/stages/')
  })
})

describe('getProfessionalProjects()', () => {
  it('appelle GET /projets/', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })
    await getProfessionalProjects()
    expect(api.get).toHaveBeenCalledWith('/projets/')
  })
})
