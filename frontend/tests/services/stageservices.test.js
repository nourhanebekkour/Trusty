import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/api', () => ({
  default: {
    get:    vi.fn(),
    post:   vi.fn(),
    put:    vi.fn(),
    delete: vi.fn(),
  },
}))

import api from '@/api'
import {
  fetchStagesEtudiant,
  creerStage,
  modifierStage,
  supprimerStage,
} from '@/services/stageService'

// ═════════════════════════════════════════════════════════════
// TESTS UNITAIRES — stageService
// ═════════════════════════════════════════════════════════════

describe('stageService.js — Tests Unitaires', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── fetchStagesEtudiant ───────────────────────────────────

  it('1 — fetchStagesEtudiant appelle GET /stages/etudiant/:id', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })

    await fetchStagesEtudiant('u1')

    expect(api.get).toHaveBeenCalledWith('/stages/etudiant/u1')
  })

  it('2 — fetchStagesEtudiant retourne le tableau data.data', async () => {
    const stages = [{ id_stage: 1, entreprise: 'TechCorp' }]
    api.get.mockResolvedValue({ data: { data: stages } })

    const result = await fetchStagesEtudiant('u1')

    expect(result).toEqual(stages)
  })

  it('3 — fetchStagesEtudiant retourne [] si data.data absent', async () => {
    api.get.mockResolvedValue({ data: {} })

    const result = await fetchStagesEtudiant('u1')

    expect(result).toEqual([])
  })

  // ── creerStage ────────────────────────────────────────────

  it('4 — creerStage appelle POST /stages/etudiant/:id avec payload', async () => {
    const payload = { entreprise: 'TechCorp', poste: 'Dev' }
    api.post.mockResolvedValue({ data: { data: { id_stage: 1, ...payload } } })

    await creerStage('u1', payload)

    expect(api.post).toHaveBeenCalledWith('/stages/etudiant/u1', payload)
  })

  it('5 — creerStage retourne data.data si présent', async () => {
    const nouveau = { id_stage: 1, entreprise: 'TechCorp' }
    api.post.mockResolvedValue({ data: { data: nouveau } })

    const result = await creerStage('u1', { entreprise: 'TechCorp' })

    expect(result).toEqual(nouveau)
  })

  it('6 — creerStage retourne data directement si data.data absent', async () => {
    const nouveau = { id_stage: 2, entreprise: 'Startup' }
    api.post.mockResolvedValue({ data: nouveau })

    const result = await creerStage('u1', { entreprise: 'Startup' })

    expect(result).toEqual(nouveau)
  })

  // ── modifierStage ─────────────────────────────────────────

  it('7 — modifierStage appelle PUT /stages/:id avec payload', async () => {
    const payload = { entreprise: 'NewCorp', poste: 'Lead Dev' }
    api.put.mockResolvedValue({ data: { data: { id_stage: 5, ...payload } } })

    await modifierStage(5, payload)

    expect(api.put).toHaveBeenCalledWith('/stages/5', payload)
  })

  it('8 — modifierStage retourne data.data si présent', async () => {
    const updated = { id_stage: 5, entreprise: 'NewCorp' }
    api.put.mockResolvedValue({ data: { data: updated } })

    const result = await modifierStage(5, { entreprise: 'NewCorp' })

    expect(result).toEqual(updated)
  })

  // ── supprimerStage ────────────────────────────────────────

  it('9 — supprimerStage appelle DELETE /stages/:id', async () => {
    api.delete.mockResolvedValue({})

    await supprimerStage(3)

    expect(api.delete).toHaveBeenCalledWith('/stages/3')
  })

  it('10 — supprimerStage ne retourne rien (void)', async () => {
    api.delete.mockResolvedValue({})

    const result = await supprimerStage(3)

    expect(result).toBeUndefined()
  })
})

// ═════════════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — stageService
// ═════════════════════════════════════════════════════════════

describe("stageService.js — Tests d'Intégration", () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('11 — créer puis récupérer : le stage créé apparaît dans la liste', async () => {
    const nouveau = { id_stage: 10, entreprise: 'AlphaCorp', poste: 'Dev' }
    api.post.mockResolvedValue({ data: { data: nouveau } })
    api.get.mockResolvedValue({ data: { data: [nouveau] } })

    const created = await creerStage('u1', { entreprise: 'AlphaCorp', poste: 'Dev' })
    const list    = await fetchStagesEtudiant('u1')

    expect(list).toContainEqual(created)
  })

  it('12 — modifier puis supprimer : les deux appels API sont corrects', async () => {
    api.put.mockResolvedValue({ data: { data: { id_stage: 7, entreprise: 'Updated' } } })
    api.delete.mockResolvedValue({})

    await modifierStage(7, { entreprise: 'Updated' })
    await supprimerStage(7)

    expect(api.put).toHaveBeenCalledWith('/stages/7', { entreprise: 'Updated' })
    expect(api.delete).toHaveBeenCalledWith('/stages/7')
  })

  it('13 — fetchStagesEtudiant avec différents ids appelle les bons endpoints', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })

    await fetchStagesEtudiant('u1')
    await fetchStagesEtudiant('u2')

    expect(api.get).toHaveBeenCalledWith('/stages/etudiant/u1')
    expect(api.get).toHaveBeenCalledWith('/stages/etudiant/u2')
  })
})
