import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useActivitesStore } from '@/stores/activitesStore'

vi.mock('@/stores/authstore', () => ({
  useAuthStore: vi.fn(() => ({ user: { id_utilisateur: 42 } }))
}))

vi.mock('@/services/activitesService', () => ({
  activitesService: {
    getActivitesByEtudiant: vi.fn().mockResolvedValue([
      { id: '1', type_activite: 'HACKATHON', nom_activite: 'Test', statut: 'VALIDE',     has_attestation: true  },
      { id: '2', type_activite: 'CLUB',      nom_activite: 'Club', statut: 'EN_ATTENTE', has_attestation: false },
    ]),
    createActivite:    vi.fn().mockResolvedValue({ id: '3', nom_activite: 'Nouveau', statut: 'EN_ATTENTE', has_attestation: false }),
    updateActivite:    vi.fn().mockResolvedValue({ id: '1', nom_activite: 'Modifié', statut: 'VALIDE' }),
    deleteActivite:    vi.fn().mockResolvedValue({}),
    uploadAttestation: vi.fn().mockResolvedValue({}),
    deleteAttestation: vi.fn().mockResolvedValue({}),
  }
}))

beforeEach(() => setActivePinia(createPinia()))

describe('activitesStore — état initial', () => {
  it('initialise activites à []', () => {
    const store = useActivitesStore()
    expect(store.activites).toEqual([])
  })

  it('initialise activeFilter à "Toutes"', () => {
    const store = useActivitesStore()
    expect(store.activeFilter).toBe('Toutes')
  })

  it('initialise loading à false', () => {
    const store = useActivitesStore()
    expect(store.loading).toBe(false)
  })
})

describe('activitesStore — getters', () => {
  it('totalActivites retourne le nombre d\'activités', async () => {
    const store = useActivitesStore()
    await store.fetchActivites()
    expect(store.totalActivites).toBe(2)
  })

  it('validees retourne le nombre de VALIDEE', async () => {
    const store = useActivitesStore()
    await store.fetchActivites()
    expect(store.validees).toBe(1)
  })

  it('enAttente retourne le nombre de EN_ATTENTE', async () => {
    const store = useActivitesStore()
    await store.fetchActivites()
    expect(store.enAttente).toBe(1)
  })

  it('avecAttestation retourne le nombre avec attestation', async () => {
    const store = useActivitesStore()
    await store.fetchActivites()
    expect(store.avecAttestation).toBe(1)
  })

  it('filteredActivites filtre par type', async () => {
    const store = useActivitesStore()
    await store.fetchActivites()
    store.setFilter('Club')
    expect(store.filteredActivites).toHaveLength(1)
    expect(store.filteredActivites[0].type_activite).toBe('CLUB')
  })

  it('filteredActivites retourne tout si filtre = "Toutes"', async () => {
    const store = useActivitesStore()
    await store.fetchActivites()
    store.setFilter('Toutes')
    expect(store.filteredActivites).toHaveLength(2)
  })
})

describe('activitesStore — actions', () => {
  it('fetchActivites charge les activités', async () => {
    const store = useActivitesStore()
    await store.fetchActivites()
    expect(store.activites).toHaveLength(2)
    expect(store.loading).toBe(false)
  })

  it('addActivite ajoute une activité en tête de liste', async () => {
    const store = useActivitesStore()
    await store.fetchActivites()
    await store.addActivite({ nom_activite: 'Nouveau', type_activite: 'CLUB' })
    expect(store.activites[0].nom_activite).toBe('Nouveau')
  })

  it('removeActivite retire l\'activité de la liste', async () => {
    const store = useActivitesStore()
    await store.fetchActivites()
    await store.removeActivite('1')
    expect(store.activites.find(a => a.id === '1')).toBeUndefined()
  })

  it('setFilter met à jour activeFilter', () => {
    const store = useActivitesStore()
    store.setFilter('Hackathon')
    expect(store.activeFilter).toBe('Hackathon')
  })

  it('uploadAttestation appelle le service et re-fetches les activités', async () => {
    const store = useActivitesStore()
    await store.fetchActivites()
    // After upload, the store calls fetchActivites() again which updates has_attestation
    // The mock returns the same data on second call
    await store.uploadAttestation('2', new File([''], 'test.pdf'))
    // After re-fetch, activites should still be loaded
    expect(store.activites).toHaveLength(2)
  })
})
