import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/stores/authstore', () => ({
  useAuthStore: vi.fn(() => ({ user: { id_utilisateur: 'u1' } }))
}))

vi.mock('@/api.js', () => ({
  default: {
    get:    vi.fn(),
    post:   vi.fn(),
    put:    vi.fn(),
    delete: vi.fn(),
    interceptors: { response: { use: vi.fn() } },
  }
}))

import { useActivitesStore } from '@/stores/activitesStore'
import api from '@/api.js'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

const ACTIVITES = [
  { id: '1', nom: 'Club Robotique', type_activite: 'CLUB',  statut: 'VALIDEE',    has_attestation: true  },
  { id: '2', nom: 'Handball',       type_activite: 'SPORT', statut: 'EN_ATTENTE', has_attestation: false },
  { id: '3', nom: 'Hackathon',      type_activite: 'CLUB',  statut: 'EN_ATTENTE', has_attestation: false },
]

describe('activitesStore + activitesService — Tests d\'intégration', () => {

  it('1 — fetchActivites : store → service → api.get /activites/etudiant/:id → activités chargées', async () => {
    api.get.mockResolvedValue({ data: [...ACTIVITES] })

    const store = useActivitesStore()
    await store.fetchActivites()

    expect(api.get).toHaveBeenCalledWith('/activites/etudiant/u1')
    expect(store.activites).toHaveLength(3)
    expect(store.loading).toBe(false)
  })

  it('2 — fetchActivites avec liste vide : activites reste [] ou données démo', async () => {
    api.get.mockResolvedValue({ data: [] })

    const store = useActivitesStore()
    await store.fetchActivites()

    expect(store.loading).toBe(false)
  })

  it('3 — fetchActivites échoue : erreur stockée, données démo affichées', async () => {
    api.get.mockRejectedValue(new Error('Réseau indisponible'))

    const store = useActivitesStore()
    await store.fetchActivites()

    expect(store.error).toBe('Réseau indisponible')
    expect(store.loading).toBe(false)
  })

  it('4 — addActivite : store → service → api.post → activité ajoutée en tête de liste', async () => {
    api.get.mockResolvedValue({ data: [...ACTIVITES] })
    const newActivite = { id: '4', nom: 'Tennis', type_activite: 'SPORT', statut: 'EN_ATTENTE', has_attestation: false }
    api.post.mockResolvedValue({ data: newActivite })

    const store = useActivitesStore()
    await store.fetchActivites()
    await store.addActivite({ nom: 'Tennis', type_activite: 'SPORT' })

    expect(api.post).toHaveBeenCalledWith('/activites/etudiant/u1', { nom: 'Tennis', type_activite: 'SPORT' })
    expect(store.activites[0].nom).toBe('Tennis')
    expect(store.activites).toHaveLength(4)
  })

  it('5 — addActivite échoue : activité ajoutée localement en mode dégradé', async () => {
    api.get.mockResolvedValue({ data: [...ACTIVITES] })
    api.post.mockRejectedValue(new Error('Erreur API'))

    const store = useActivitesStore()
    await store.fetchActivites()
    await store.addActivite({ nom: 'Tennis', type_activite: 'SPORT' })

    // En mode dégradé l'activité est ajoutée localement avec statut EN_ATTENTE
    expect(store.activites[0].nom).toBe('Tennis')
    expect(store.activites[0].statut).toBe('EN_ATTENTE')
  })

  it('6 — getter filteredActivites : filtre par type_activite', async () => {
    api.get.mockResolvedValue({ data: [...ACTIVITES] })

    const store = useActivitesStore()
    await store.fetchActivites()

    store.$patch({ activeFilter: 'club' })
    expect(store.filteredActivites).toHaveLength(2) // Club Robotique + Hackathon

    store.$patch({ activeFilter: 'sport' })
    expect(store.filteredActivites).toHaveLength(1)

    store.$patch({ activeFilter: 'Toutes' })
    expect(store.filteredActivites).toHaveLength(3)
  })

  it('7 — getters stats : totalActivites, validees, enAttente, avecAttestation', async () => {
    api.get.mockResolvedValue({ data: [...ACTIVITES] })

    const store = useActivitesStore()
    await store.fetchActivites()

    expect(store.totalActivites).toBe(3)
    expect(store.validees).toBe(1)
    expect(store.enAttente).toBe(2)
    expect(store.avecAttestation).toBe(1)
  })

  it('8 — workflow : fetch → ajouter → filtrer → stats cohérentes', async () => {
    api.get.mockResolvedValue({ data: [...ACTIVITES] })
    const newActivite = { id: '4', nom: 'Natation', type_activite: 'SPORT', statut: 'EN_ATTENTE', has_attestation: false }
    api.post.mockResolvedValue({ data: newActivite })

    const store = useActivitesStore()
    await store.fetchActivites()
    await store.addActivite({ nom: 'Natation', type_activite: 'SPORT' })

    expect(store.totalActivites).toBe(4)
    store.$patch({ activeFilter: 'sport' })
    expect(store.filteredActivites).toHaveLength(2) // Handball + Natation
  })
})
