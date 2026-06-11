import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock api ─────────────────────────────────────────────────────────────────
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

// ═════════════════════════════════════════════════════════════════════════════
// TESTS UNITAIRES — stageService
// Principe : chaque fonction testée en isolation, api toujours mockée.
// On vérifie : (1) l'endpoint, (2) les paramètres, (3) le retour, (4) les erreurs.
// ═════════════════════════════════════════════════════════════════════════════

describe('stageService.js — Tests Unitaires', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── fetchStagesEtudiant ────────────────────────────────────────────────────

  it('1 — fetchStagesEtudiant appelle GET /stages/etudiant/:id', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })

    await fetchStagesEtudiant('u1')

    expect(api.get).toHaveBeenCalledWith('/stages/etudiant/u1')
  })

  it('2 — fetchStagesEtudiant retourne data.data', async () => {
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

  it('4 — fetchStagesEtudiant utilise bien l\'id dans l\'URL', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })

    await fetchStagesEtudiant('etudiant-xyz')

    expect(api.get).toHaveBeenCalledWith('/stages/etudiant/etudiant-xyz')
  })

  // ── creerStage ─────────────────────────────────────────────────────────────

  it('5 — creerStage appelle POST /stages/etudiant/:id avec payload', async () => {
    const payload = { entreprise: 'TechCorp', poste: 'Dev' }
    api.post.mockResolvedValue({ data: { data: { id_stage: 1, ...payload } } })

    await creerStage('u1', payload)

    expect(api.post).toHaveBeenCalledWith('/stages/etudiant/u1', payload)
  })

  it('6 — creerStage retourne data.data si présent', async () => {
    const nouveau = { id_stage: 1, entreprise: 'TechCorp' }
    api.post.mockResolvedValue({ data: { data: nouveau } })

    const result = await creerStage('u1', { entreprise: 'TechCorp' })

    expect(result).toEqual(nouveau)
  })

  it('7 — creerStage retourne data directement si data.data absent', async () => {
    const nouveau = { id_stage: 2, entreprise: 'Startup' }
    api.post.mockResolvedValue({ data: nouveau })

    const result = await creerStage('u1', { entreprise: 'Startup' })

    expect(result).toEqual(nouveau)
  })

  // ── modifierStage ──────────────────────────────────────────────────────────

  it('8 — modifierStage appelle PUT /stages/:id avec payload', async () => {
    const payload = { entreprise: 'NewCorp', poste: 'Lead Dev' }
    api.put.mockResolvedValue({ data: { data: { id_stage: 5, ...payload } } })

    await modifierStage(5, payload)

    expect(api.put).toHaveBeenCalledWith('/stages/5', payload)
  })

  it('9 — modifierStage retourne data.data si présent', async () => {
    const updated = { id_stage: 5, entreprise: 'NewCorp' }
    api.put.mockResolvedValue({ data: { data: updated } })

    const result = await modifierStage(5, { entreprise: 'NewCorp' })

    expect(result).toEqual(updated)
  })

  it('10 — modifierStage retourne data directement si data.data absent', async () => {
    const updated = { id_stage: 5, entreprise: 'NewCorp' }
    api.put.mockResolvedValue({ data: updated })

    const result = await modifierStage(5, { entreprise: 'NewCorp' })

    expect(result).toEqual(updated)
  })

  // ── supprimerStage ─────────────────────────────────────────────────────────

  it('11 — supprimerStage appelle DELETE /stages/:id', async () => {
    api.delete.mockResolvedValue({})

    await supprimerStage(3)

    expect(api.delete).toHaveBeenCalledWith('/stages/3')
  })

  it('12 — supprimerStage ne retourne rien (void)', async () => {
    api.delete.mockResolvedValue({})

    const result = await supprimerStage(3)

    expect(result).toBeUndefined()
  })
})
