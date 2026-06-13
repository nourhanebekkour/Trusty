import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ActiviteCard from '@/components/activites/ActiviteCard.vue'

vi.mock('@/stores/activitesStore', () => ({
  useActivitesStore: vi.fn(),
}))

import { useActivitesStore } from '@/stores/activitesStore'

let mockRemoveActivite
let mockUploadAttestation

function makeMockStore() {
  mockRemoveActivite    = vi.fn()
  mockUploadAttestation = vi.fn()
  return {
    activites: [], loading: false, error: null,
    totalActivites: 0, validees: 0, enAttente: 0, avecAttestation: 0,
    activeFilter: 'Toutes', filteredActivites: [],
    removeActivite:    mockRemoveActivite,
    uploadAttestation: mockUploadAttestation,
    setFilter: vi.fn(),
  }
}

const BASE_ACTIVITE = {
  id: 'act-1',
  type_activite: 'HACKATHON',
  nom_activite:  'Hackathon IA Maroc 2024',
  organisation:  'Technopark Tanger',
  role:          'Participant',
  description:   'Solution IA en 48h.',
  date_debut:    '2024-03-01',
  date_fin:      '2024-03-31',
  statut:        'VALIDE',
  has_attestation: false,
  est_public:    true,
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  useActivitesStore.mockReturnValue(makeMockStore())
})

const mountCard = (overrides = {}) =>
  mount(ActiviteCard, { props: { activite: { ...BASE_ACTIVITE, ...overrides } } })

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — ActiviteCard
// ═══════════════════════════════════════════════════════

describe('ActiviteCard.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    expect(mountCard().exists()).toBe(true)
  })

  it('2 — affiche le nom de l\'activité', () => {
    expect(mountCard().find('.activite-title').text()).toBe('Hackathon IA Maroc 2024')
  })

  it('3 — affiche l\'organisation', () => {
    expect(mountCard().text()).toContain('Technopark Tanger')
  })

  it('4 — affiche le rôle', () => {
    expect(mountCard().text()).toContain('Participant')
  })

  it('5 — affiche la description', () => {
    expect(mountCard().find('.activite-desc').text()).toBe('Solution IA en 48h.')
  })

  it('6 — le badge type affiche "Hackathon"', () => {
    expect(mountCard().find('.type-badge').text()).toContain('Hackathon')
  })

  it('7 — le badge type a la classe CSS type-hackathon', () => {
    const badges = mountCard().findAll('.badge')
    expect(badges[0].classes()).toContain('type-hackathon')
  })

  it('8 — le badge statut affiche "Validée" pour VALIDEE', () => {
    expect(mountCard().find('.statut-badge').text()).toContain('Validée')
  })

  it('9 — le badge statut a la classe statut-validee', () => {
    expect(mountCard().find('.statut-badge').classes()).toContain('statut-validee')
  })

  it('10 — le badge statut affiche "En attente" pour EN_ATTENTE', () => {
    expect(mountCard({ statut: 'EN_ATTENTE' }).find('.statut-badge').text()).toContain('En attente')
  })

  it('11 — le badge statut a la classe statut-attente pour EN_ATTENTE', () => {
    expect(mountCard({ statut: 'EN_ATTENTE' }).find('.statut-badge').classes()).toContain('statut-attente')
  })

  it('12 — affiche "Public" si est_public = true', () => {
    expect(mountCard().text()).toContain('Public')
  })

  it('13 — n\'affiche pas "Public" si est_public = false', () => {
    expect(mountCard({ est_public: false }).text()).not.toContain('Public')
  })

  it('14 — affiche "Joindre une attestation" si has_attestation = false', () => {
    expect(mountCard().text()).toContain('Joindre une attestation')
  })

  it('15 — affiche "Attestation jointe" si has_attestation = true', () => {
    expect(mountCard({ has_attestation: true }).text()).toContain('Attestation jointe')
  })

  it('16 — n\'affiche pas "Joindre une attestation" si has_attestation = true', () => {
    expect(mountCard({ has_attestation: true }).text()).not.toContain('Joindre une attestation')
  })

  it('17 — la carte a la classe type-hackathon sur l\'élément racine', () => {
    expect(mountCard().find('.activite-card').classes()).toContain('type-hackathon')
  })

  it('18 — affiche les boutons Modifier et Supprimer', () => {
    const buttons = mountCard().findAll('.action-btn')
    expect(buttons.length).toBe(2)
    expect(buttons[1].classes()).toContain('danger')
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — ActiviteCard
// ═══════════════════════════════════════════════════════

describe('ActiviteCard.vue — Tests d\'Intégration', () => {

  it('19 — clic sur Modifier émet "edit" avec l\'activité complète', async () => {
    const wrapper = mountCard()
    await wrapper.find('.action-btn:not(.danger)').trigger('click')
    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')[0][0].nom_activite).toBe('Hackathon IA Maroc 2024')
  })

  it('20 — clic sur "Supprimer attestation" émet "delete-attestation" avec l\'id', async () => {
    const wrapper = mountCard({ has_attestation: true })
    await wrapper.find('.footer-btn.danger-sm').trigger('click')
    expect(wrapper.emitted('delete-attestation')).toBeTruthy()
    expect(wrapper.emitted('delete-attestation')[0][0]).toBe('act-1')
  })

  it('21 — clic sur Supprimer avec confirm=true appelle store.removeActivite(id)', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const wrapper = mountCard()
    await wrapper.find('.action-btn.danger').trigger('click')
    expect(mockRemoveActivite).toHaveBeenCalledWith('act-1')
  })

  it('22 — clic sur Supprimer avec confirm=false n\'appelle pas store.removeActivite', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const wrapper = mountCard()
    await wrapper.find('.action-btn.danger').trigger('click')
    expect(mockRemoveActivite).not.toHaveBeenCalled()
  })
})
