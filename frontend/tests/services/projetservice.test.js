import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/api', () => ({
  default: {
    get:    vi.fn(),
    post:   vi.fn(),
    put:    vi.fn(),
    delete: vi.fn(),
    interceptors: { response: { use: vi.fn() } },
  }
}))

import api from '@/api'
import projetService from '@/services/projetService'

beforeEach(() => vi.clearAllMocks())

describe('projetService — getAll', () => {
  it('retourne la liste des projets', async () => {
    api.get.mockResolvedValue({ data: { data: [{ id_projet: '1', titre: 'Projet A' }] } })
    const result = await projetService.getAll()
    expect(api.get).toHaveBeenCalledWith('/projets/')
    expect(result).toHaveLength(1)
    expect(result[0].titre).toBe('Projet A')
  })

  it('retourne un tableau vide si data.data n\'est pas un tableau', async () => {
    api.get.mockResolvedValue({ data: { data: null } })
    const result = await projetService.getAll()
    expect(result).toEqual([])
  })
})

describe('projetService — create', () => {
  it('crée un projet et le retourne', async () => {
    const payload = { titre: 'Nouveau Projet', type_projet: 'PERSONNEL' }
    api.post.mockResolvedValue({ data: { data: { id_projet: '2', ...payload } } })
    const result = await projetService.create(payload)
    expect(api.post).toHaveBeenCalledWith('/projets/', payload)
    expect(result.id_projet).toBe('2')
  })

  it('retourne null si data.data absent', async () => {
    api.post.mockResolvedValue({ data: {} })
    const result = await projetService.create({})
    expect(result).toBeNull()
  })
})

describe('projetService — update', () => {
  it('met à jour le projet', async () => {
    const payload = { titre: 'Projet Modifié' }
    api.put.mockResolvedValue({ data: { data: { id_projet: '1', ...payload } } })
    const result = await projetService.update('1', payload)
    expect(api.put).toHaveBeenCalledWith('/projets/1', payload)
    expect(result.titre).toBe('Projet Modifié')
  })

  it('retourne null si data.data absent', async () => {
    api.put.mockResolvedValue({ data: {} })
    const result = await projetService.update('1', {})
    expect(result).toBeNull()
  })
})

describe('projetService — remove', () => {
  it('supprime le projet', async () => {
    api.delete.mockResolvedValue({})
    await projetService.remove('1')
    expect(api.delete).toHaveBeenCalledWith('/projets/1')
  })
})
