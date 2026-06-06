import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/api', () => ({
  default: {
    get:  vi.fn(),
    post: vi.fn(),
    put:  vi.fn(),
    interceptors: { response: { use: vi.fn() } },
  }
}))

import api from '@/api'
import {
  fetchProjetsAValider,
  validerProjet,
  fetchStagesAValider,
  validerStage,
  fetchNotifications,
  marquerNotificationLue,
} from '@/services/professorservices.js'

beforeEach(() => vi.clearAllMocks())

// ─────────────────────────────────────────────
describe('professorServices — fetchProjetsAValider', () => {
  it('retourne les projets à valider', async () => {
    api.get.mockResolvedValue({ data: { data: [{ id_projet: 1 }] } })
    const result = await fetchProjetsAValider()
    expect(api.get).toHaveBeenCalledWith('/projets/a-valider')
    expect(result).toHaveLength(1)
  })

  it('retourne un tableau vide si data vide', async () => {
    api.get.mockResolvedValue({ data: {} })
    const result = await fetchProjetsAValider()
    expect(result).toEqual([])
  })
})

// ─────────────────────────────────────────────
describe('professorServices — validerProjet', () => {
  it('valide un projet avec VALIDE', async () => {
    api.post.mockResolvedValue({ data: { data: { id_projet: 1, status: 'VALIDE' } } })
    const result = await validerProjet(1, 'VALIDE', 'Bon travail', 'Excellent')
    expect(api.post).toHaveBeenCalledWith('/projets/1/valider', {
      decision: 'VALIDE',
      commentaire: 'Bon travail',
      appreciation: 'Excellent',
    })
    expect(result).toBeDefined()
  })

  it('valide avec REJETE', async () => {
    api.post.mockResolvedValue({ data: { data: {} } })
    await validerProjet(2, 'REJETE', 'Insuffisant')
    expect(api.post).toHaveBeenCalledWith('/projets/2/valider', expect.objectContaining({
      decision: 'REJETE',
    }))
  })

  it('passe un commentaire vide par défaut', async () => {
    api.post.mockResolvedValue({ data: { data: {} } })
    await validerProjet(3, 'VALIDE')
    expect(api.post).toHaveBeenCalledWith('/projets/3/valider', expect.objectContaining({
      commentaire: '',
    }))
  })
})

// ─────────────────────────────────────────────
describe('professorServices — fetchStagesAValider', () => {
  it('retourne les stages à valider', async () => {
    api.get.mockResolvedValue({ data: { data: [{ id_stage: 10 }] } })
    const result = await fetchStagesAValider()
    expect(api.get).toHaveBeenCalledWith('/stages/a-valider')
    expect(result).toHaveLength(1)
  })
})

// ─────────────────────────────────────────────
describe('professorServices — validerStage', () => {
  it('valide un stage avec les bons paramètres', async () => {
    api.post.mockResolvedValue({ data: { data: { id_stage: 10 } } })
    await validerStage(10, 'VALIDE', 'Stage réussi')
    expect(api.post).toHaveBeenCalledWith('/stages/10/valider', {
      decision: 'VALIDE',
      commentaire: 'Stage réussi',
    })
  })

  it('passe un commentaire vide par défaut', async () => {
    api.post.mockResolvedValue({ data: { data: {} } })
    await validerStage(5, 'REJETE')
    expect(api.post).toHaveBeenCalledWith('/stages/5/valider', expect.objectContaining({
      commentaire: '',
    }))
  })
})

// ─────────────────────────────────────────────
describe('professorServices — fetchNotifications', () => {
  it('retourne les notifications', async () => {
    api.get.mockResolvedValue({ data: { data: [{ id_notification: 1 }] } })
    const result = await fetchNotifications()
    expect(result).toHaveLength(1)
  })

  it('retourne tableau vide si data absent', async () => {
    api.get.mockResolvedValue({ data: {} })
    const result = await fetchNotifications()
    expect(result).toEqual([])
  })
})

// ─────────────────────────────────────────────
describe('professorServices — marquerNotificationLue', () => {
  it('appelle PUT /notifications/:id/lire', async () => {
    api.put.mockResolvedValue({})
    await marquerNotificationLue(3)
    expect(api.put).toHaveBeenCalledWith('/notifications/3/lire')
  })
})
