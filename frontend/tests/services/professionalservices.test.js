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
  fetchCandidats,
  envoyerRecommandation,
  fetchNotifications,
  marquerNotificationLue,
} from '@/services/professionalservices.js'

beforeEach(() => vi.clearAllMocks())

// ─────────────────────────────────────────────
describe('professionalServices — fetchCandidats', () => {
  it('retourne des étudiants uniques depuis les stages', async () => {
    api.get.mockResolvedValue({ data: { data: [
      { etudiant: { id_etudiant: 'e1', nom: 'Alice' } },
      { etudiant: { id_etudiant: 'e2', nom: 'Bob'   } },
      { etudiant: { id_etudiant: 'e1', nom: 'Alice' } }, // doublon
    ]}})
    const result = await fetchCandidats()
    expect(api.get).toHaveBeenCalledWith('/stages')
    expect(result).toHaveLength(2)
  })

  it('retourne un tableau vide si data.data est vide', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })
    const result = await fetchCandidats()
    expect(result).toEqual([])
  })

  it('ignore les entrées sans etudiant valide', async () => {
    api.get.mockResolvedValue({ data: { data: [
      { etudiant: null },
      { etudiant: { id_etudiant: 'e1' } },
    ]}})
    const result = await fetchCandidats()
    expect(result).toHaveLength(1)
  })
})

// ─────────────────────────────────────────────
describe('professionalServices — envoyerRecommandation', () => {
  it('appelle POST /recommandations avec les bons paramètres', async () => {
    api.post.mockResolvedValue({ data: { data: { id: 1 } } })
    await envoyerRecommandation('e1', 'Excellent candidat')
    expect(api.post).toHaveBeenCalledWith('/recommandations', {
      id_etudiant: 'e1',
      message: 'Excellent candidat',
    })
  })

  it('retourne data.data de la réponse', async () => {
    api.post.mockResolvedValue({ data: { data: { id: 42 } } })
    const result = await envoyerRecommandation('e1', 'message')
    expect(result).toEqual({ id: 42 })
  })
})

// ─────────────────────────────────────────────
describe('professionalServices — fetchNotifications', () => {
  it('retourne les notifications', async () => {
    api.get.mockResolvedValue({ data: { data: [
      { id_notification: 1, titre: 'Test', message: 'msg', est_lue: false }
    ]}})
    const result = await fetchNotifications()
    expect(api.get).toHaveBeenCalledWith('/notifications')
    expect(result).toHaveLength(1)
  })

  it('retourne un tableau vide si data.data absent', async () => {
    api.get.mockResolvedValue({ data: {} })
    const result = await fetchNotifications()
    expect(result).toEqual([])
  })
})

// ─────────────────────────────────────────────
describe('professionalServices — marquerNotificationLue', () => {
  it('appelle PUT /notifications/:id/lire', async () => {
    api.put.mockResolvedValue({})
    await marquerNotificationLue(3)
    expect(api.put).toHaveBeenCalledWith('/notifications/3/lire')
  })
})
