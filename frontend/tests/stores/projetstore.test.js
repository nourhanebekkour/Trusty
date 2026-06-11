import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/projetService', () => ({
  default: {
    getAll:  vi.fn(),
    getById: vi.fn(),
    create:  vi.fn(),
    update:  vi.fn(),
    remove:  vi.fn(),
  }
}))

import { useProjetStore } from '@/stores/projetStore'
import projetService from '@/services/projetService'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

// ─────────────────────────────────────────────
describe('ProjetStore — fetchProjets', () => {
  it('charge la liste des projets', async () => {
    projetService.getAll.mockResolvedValue([
      { id_projet: '1', titre: 'Projet A', status_validation: 'VALIDE' },
      { id_projet: '2', titre: 'Projet B', status_validation: 'EN_ATTENTE' },
    ])
    const store = useProjetStore()
    await store.fetchProjets()
    expect(store.projets).toHaveLength(2)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('stocke l\'erreur si l\'API échoue', async () => {
    projetService.getAll.mockRejectedValue({ message: 'Erreur serveur' })
    const store = useProjetStore()
    await store.fetchProjets()
    expect(store.error).toBe('Erreur serveur')
    expect(store.projets).toHaveLength(0)
    expect(store.loading).toBe(false)
  })
})

// ─────────────────────────────────────────────
describe('ProjetStore — createProjet', () => {
  it('ajoute le projet créé en tête de liste', async () => {
    const nouveau = { id_projet: '3', titre: 'Nouveau', status_validation: 'EN_ATTENTE' }
    projetService.create.mockResolvedValue(nouveau)
    const store = useProjetStore()
    await store.createProjet({ titre: 'Nouveau' })
    expect(store.projets[0]).toEqual(nouveau)
  })

  it('rafraîchit la liste si create retourne null', async () => {
    projetService.create.mockResolvedValue(null)
    projetService.getAll.mockResolvedValue([])
    const store = useProjetStore()
    await store.createProjet({})
    expect(projetService.getAll).toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────
describe('ProjetStore — updateProjet', () => {
  it('met à jour le projet dans la liste', async () => {
    const updated = { id_projet: '1', titre: 'Modifié', status_validation: 'VALIDE' }
    projetService.update.mockResolvedValue(updated)
    const store = useProjetStore()
    store.projets.push({ id_projet: '1', titre: 'Original', status_validation: 'EN_ATTENTE' })
    await store.updateProjet('1', { titre: 'Modifié' })
    expect(store.projets[0].titre).toBe('Modifié')
  })

  it('rafraîchit si update retourne null', async () => {
    projetService.update.mockResolvedValue(null)
    projetService.getAll.mockResolvedValue([])
    const store = useProjetStore()
    await store.updateProjet('1', {})
    expect(projetService.getAll).toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────
describe('ProjetStore — deleteProjet', () => {
  it('supprime le projet de la liste', async () => {
    projetService.remove.mockResolvedValue()
    const store = useProjetStore()
    store.projets.push({ id_projet: '1', titre: 'A' }, { id_projet: '2', titre: 'B' })
    await store.deleteProjet('1')
    expect(store.projets).toHaveLength(1)
    expect(store.projets[0].id_projet).toBe('2')
  })
})

// ─────────────────────────────────────────────
describe('ProjetStore — getter stats', () => {
  it('calcule les statistiques correctement', () => {
    const store = useProjetStore()
    store.projets.push(
      { id_projet: '1', status_validation: 'VALIDE'    },
      { id_projet: '2', status_validation: 'EN_ATTENTE' },
      { id_projet: '3', status_validation: 'VALIDE'    },
    )
    expect(store.stats.total).toBe(3)
    expect(store.stats.valides).toBe(2)
    expect(store.stats.enAttente).toBe(1)
  })

  it('retourne des zéros si liste vide', () => {
    const store = useProjetStore()
    expect(store.stats).toEqual({ total: 0, valides: 0, enAttente: 0 })
  })
})

// ─────────────────────────────────────────────
describe('ProjetStore — clearError', () => {
  it('remet l\'erreur à null', () => {
    const store = useProjetStore()
    store.error = 'Une erreur'
    store.clearError()
    expect(store.error).toBeNull()
  })
})
