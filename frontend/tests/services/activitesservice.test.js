import { describe, it, expect, vi, beforeEach } from 'vitest'
import { activitesService } from '@/services/activitesService'

vi.mock('@/api', () => ({
  default: {
    get:    vi.fn(),
    post:   vi.fn(),
    put:    vi.fn(),
    delete: vi.fn(),
  }
}))

import api from '@/api'

beforeEach(() => vi.clearAllMocks())

describe('activitesService.getActivitesByEtudiant()', () => {
  it('appelle GET /activites/etudiant/:id', async () => {
    api.get.mockResolvedValue({ data: [] })
    await activitesService.getActivitesByEtudiant(42)
    expect(api.get).toHaveBeenCalledWith('/activites/etudiant/42')
  })

  it('retourne les données de la réponse', async () => {
    const data = [{ id: '1', nom_activite: 'Test' }]
    api.get.mockResolvedValue({ data })
    const result = await activitesService.getActivitesByEtudiant(42)
    expect(result).toEqual(data)
  })
})

describe('activitesService.createActivite()', () => {
  it('appelle POST /activites/etudiant/:id avec les données', async () => {
    api.post.mockResolvedValue({ data: { id: '3' } })
    const body = { nom_activite: 'Nouveau', type_activite: 'HACKATHON' }
    await activitesService.createActivite(42, body)
    expect(api.post).toHaveBeenCalledWith('/activites/etudiant/42', body)
  })
})

describe('activitesService.updateActivite()', () => {
  it('appelle PUT /activites/:id avec les données', async () => {
    api.put.mockResolvedValue({ data: { id: '1' } })
    const body = { nom_activite: 'Modifié' }
    await activitesService.updateActivite('1', body)
    expect(api.put).toHaveBeenCalledWith('/activites/1', body)
  })
})

describe('activitesService.deleteActivite()', () => {
  it('appelle DELETE /activites/:id', async () => {
    api.delete.mockResolvedValue({ data: {} })
    await activitesService.deleteActivite('1')
    expect(api.delete).toHaveBeenCalledWith('/activites/1')
  })
})

describe('activitesService.uploadAttestation()', () => {
  it('appelle POST /activites/:id/attestation avec FormData', async () => {
    api.post.mockResolvedValue({ data: {} })
    const file = new File(['content'], 'attestation.pdf')
    await activitesService.uploadAttestation('1', file)
    // The service calls api.post with just path and FormData (no extra headers config)
    expect(api.post).toHaveBeenCalledWith(
      '/activites/1/attestation',
      expect.any(FormData)
    )
  })
})

describe('activitesService.deleteAttestation()', () => {
  it('appelle DELETE /activites/:id/attestation', async () => {
    api.delete.mockResolvedValue({ data: {} })
    await activitesService.deleteAttestation('1')
    expect(api.delete).toHaveBeenCalledWith('/activites/1/attestation')
  })
})
