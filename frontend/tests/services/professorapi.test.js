import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getProfessorNotifications,
  markProfessorNotificationAsRead,
  approveProfessorValidation,
  requestProfessorChanges,
  getProfessorValidations,
} from '@/services/professorApi'

vi.mock('@/services/api', () => ({
  default: {
    get:    vi.fn(),
    post:   vi.fn(),
    put:    vi.fn(),
    delete: vi.fn(),
    patch:  vi.fn(),
  }
}))

import api from '@/services/api'

beforeEach(() => vi.clearAllMocks())

describe('getProfessorNotifications()', () => {
  it('appelle GET /notifications/', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })
    await getProfessorNotifications()
    expect(api.get).toHaveBeenCalledWith('/notifications/', { params: {} })
  })

  it('retourne un tableau de notifications mappées', async () => {
    api.get.mockResolvedValue({
      data: { data: [{ id_notification: 1, titre: 'Projet soumis', message: 'msg', est_lue: false, date_creation: '2026-01-01', type_notification: 'PROJET' }] }
    })
    const result = await getProfessorNotifications()
    expect(result.notifications).toHaveLength(1)
    expect(result.notifications[0]).toMatchObject({ id: 1, title: 'Projet soumis' })
  })
})

describe('markProfessorNotificationAsRead()', () => {
  it('appelle PUT /notifications/:id/lire', async () => {
    api.put.mockResolvedValue({})
    await markProfessorNotificationAsRead(7)
    expect(api.put).toHaveBeenCalledWith('/notifications/7/lire')
  })
})

describe('approveProfessorValidation()', () => {
  it('appelle POST /projets/:id/valider avec VALIDE', async () => {
    api.post.mockResolvedValue({})
    await approveProfessorValidation(10, 'projet')
    expect(api.post).toHaveBeenCalledWith('/projets/10/valider', { decision: 'VALIDE' })
  })

  it('appelle POST /stages/:id/valider pour un stage', async () => {
    api.post.mockResolvedValue({})
    await approveProfessorValidation(5, 'stage')
    expect(api.post).toHaveBeenCalledWith('/stages/5/valider', { decision: 'VALIDE' })
  })
})

describe('requestProfessorChanges()', () => {
  it('appelle POST /projets/:id/valider avec REJETE', async () => {
    api.post.mockResolvedValue({})
    await requestProfessorChanges(10, { reason: 'Incomplet' }, 'projet')
    expect(api.post).toHaveBeenCalledWith('/projets/10/valider', { decision: 'REJETE', commentaire: 'Incomplet' })
  })
})

describe('getProfessorValidations()', () => {
  it('retourne les stats EN_ATTENTE et VALIDE', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })
    const result = await getProfessorValidations()
    expect(result).toHaveProperty('validations')
    expect(result).toHaveProperty('stats')
    expect(result.stats).toHaveProperty('pendingCount')
    expect(result.stats).toHaveProperty('approvedCount')
  })
})
