import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// ── Mock api uniquement (frontière HTTP) ─────────────────────────────────────
// projetService N'EST PAS mocké : vrai module utilisé.
vi.mock('@/api', () => ({
  default: {
    get:    vi.fn(),
    post:   vi.fn(),
    put:    vi.fn(),
    delete: vi.fn(),
  },
}))

import api from '@/api'
import { useProjetStore } from '@/stores/projetStore'

// ═════════════════════════════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — projetStore + projetService (réel) + api (mockée)
// ═════════════════════════════════════════════════════════════════════════════

describe("projetStore + projetService — Tests d'intégration", () => {

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // ── fetchProjets ───────────────────────────────────────────────────────────

  it('1 — fetchProjets : store → service → api.get /projets/ → projets mis à jour', async () => {
    const projets = [
      { id_projet: 'p1', titre: 'Projet IA', status_validation: 'VALIDE' },
      { id_projet: 'p2', titre: 'App Mobile', status_validation: 'EN_ATTENTE' },
    ]
    api.get.mockResolvedValue({ data: { data: projets } })

    const store = useProjetStore()
    await store.fetchProjets()

    expect(api.get).toHaveBeenCalledWith('/projets/')
    expect(store.projets).toEqual(projets)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('2 — fetchProjets avec liste vide : projets = []', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })

    const store = useProjetStore()
    await store.fetchProjets()

    expect(store.projets).toEqual([])
  })

  it('3 — fetchProjets échoue : erreur propagée dans store.error', async () => {
    api.get.mockRejectedValue({ response: { data: { message: 'Serveur indisponible' } }, message: 'Serveur indisponible' })

    const store = useProjetStore()
    await store.fetchProjets()

    expect(store.error).toBeTruthy()
    expect(store.loading).toBe(false)
  })

  // ── createProjet ───────────────────────────────────────────────────────────

  it('4 — createProjet : store → service → api.post /projets/ → projet ajouté en tête de liste', async () => {
    const existant = { id_projet: 'p1', titre: 'Existant', status_validation: 'VALIDE' }
    const nouveau  = { id_projet: 'p2', titre: 'Nouveau', status_validation: 'EN_ATTENTE' }
    api.get.mockResolvedValue({ data: { data: [existant] } })
    api.post.mockResolvedValue({ data: { data: nouveau } })

    const store = useProjetStore()
    await store.fetchProjets()
    await store.createProjet({ titre: 'Nouveau', type_projet: 'PFA', description: 'desc' })

    expect(api.post).toHaveBeenCalledWith('/projets/', { titre: 'Nouveau', type_projet: 'PFA', description: 'desc' })
    expect(store.projets[0]).toEqual(nouveau)
    expect(store.projets).toHaveLength(2)
  })

  // ── updateProjet ───────────────────────────────────────────────────────────

  it('5 — updateProjet : store → service → api.put /projets/:id → projet mis à jour dans la liste', async () => {
    const initial = [{ id_projet: 'p1', titre: 'Ancien titre', status_validation: 'EN_ATTENTE' }]
    const updated  = { id_projet: 'p1', titre: 'Nouveau titre', status_validation: 'VALIDE' }
    api.get.mockResolvedValue({ data: { data: initial } })
    api.put.mockResolvedValue({ data: { data: updated } })

    const store = useProjetStore()
    await store.fetchProjets()
    await store.updateProjet('p1', { titre: 'Nouveau titre' })

    expect(api.put).toHaveBeenCalledWith('/projets/p1', { titre: 'Nouveau titre' })
    expect(store.projets[0].titre).toBe('Nouveau titre')
    expect(store.projets[0].status_validation).toBe('VALIDE')
  })

  // ── deleteProjet ───────────────────────────────────────────────────────────

  it('6 — deleteProjet : store → service → api.delete /projets/:id → retiré de la liste', async () => {
    const projets = [
      { id_projet: 'p1', titre: 'A garder', status_validation: 'VALIDE' },
      { id_projet: 'p2', titre: 'A supprimer', status_validation: 'EN_ATTENTE' },
    ]
    api.get.mockResolvedValue({ data: { data: projets } })
    api.delete.mockResolvedValue({})

    const store = useProjetStore()
    await store.fetchProjets()
    await store.deleteProjet('p2')

    expect(api.delete).toHaveBeenCalledWith('/projets/p2')
    expect(store.projets).toHaveLength(1)
    expect(store.projets[0].id_projet).toBe('p1')
  })

  // ── stats computed ─────────────────────────────────────────────────────────

  it('7 — stats computed depuis données api réelles', async () => {
    api.get.mockResolvedValue({
      data: {
        data: [
          { id_projet: 'p1', titre: 'A', status_validation: 'VALIDE' },
          { id_projet: 'p2', titre: 'B', status_validation: 'VALIDE' },
          { id_projet: 'p3', titre: 'C', status_validation: 'EN_ATTENTE' },
        ],
      },
    })

    const store = useProjetStore()
    await store.fetchProjets()

    expect(store.stats.total).toBe(3)
    expect(store.stats.valides).toBe(2)
    expect(store.stats.enAttente).toBe(1)
  })

  // ── workflow complet ───────────────────────────────────────────────────────

  it('8 — workflow : charger → créer → supprimer → liste cohérente', async () => {
    api.get.mockResolvedValue({ data: { data: [{ id_projet: 'p1', titre: 'Base', status_validation: 'VALIDE' }] } })
    api.post.mockResolvedValue({ data: { data: { id_projet: 'p2', titre: 'Ajouté', status_validation: 'EN_ATTENTE' } } })
    api.delete.mockResolvedValue({})

    const store = useProjetStore()
    await store.fetchProjets()
    await store.createProjet({ titre: 'Ajouté' })
    expect(store.projets).toHaveLength(2)

    await store.deleteProjet('p2')
    expect(store.projets).toHaveLength(1)
    expect(store.projets[0].id_projet).toBe('p1')
  })
})
