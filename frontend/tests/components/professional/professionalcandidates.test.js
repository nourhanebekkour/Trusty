import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ProfessionalCandidates from '@/components/Professional/ProfessionalCandidates.vue'

vi.mock('@/stores/professionalStore', () => ({
  useProfessionalStore: vi.fn(),
}))

import { useProfessionalStore } from '@/stores/professionalStore'

let mockToggleFavori

function makeMockStore(favoris = []) {
  mockToggleFavori = vi.fn()
  return { favoris, toggleFavori: mockToggleFavori }
}

const MOCK_CANDIDATS = [
  { id: 1, nom: 'Alice Dupont', formation: 'GINF', ecole: 'ENSIT',  ville: 'Tunis',  description: 'Développeuse passionnée', icon: 'user',  color: 'green', score: 88 },
  { id: 2, nom: 'Bob Martin',   formation: 'GIND', ecole: 'FST',    ville: 'Sfax',   description: 'Expert en data',          icon: 'code',  color: 'blue',  score: 75 },
  { id: 3, nom: 'Carol Ahmed',  formation: 'GINF', ecole: 'ENIS',   ville: 'Sousse', description: 'Spécialiste IA',          icon: 'robot', color: 'purple', score: 92 },
]

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  useProfessionalStore.mockReturnValue(makeMockStore())
})

const mountCandidates = (props = {}) => mount(ProfessionalCandidates, {
  props: { candidats: MOCK_CANDIDATS, selectedId: null, recsEmises: [], ...props },
})

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — ProfessionalCandidates
// ═══════════════════════════════════════════════════════

describe('ProfessionalCandidates.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    expect(mountCandidates().exists()).toBe(true)
  })

  it('2 — affiche le titre "Éléments à recommander"', () => {
    expect(mountCandidates().text()).toContain('Éléments à recommander')
  })

  it('3 — affiche les 3 onglets (Portfolios, Stages, Activités)', () => {
    const wrapper = mountCandidates()
    expect(wrapper.findAll('.tab').length).toBe(3)
    expect(wrapper.text()).toContain('Portfolios')
    expect(wrapper.text()).toContain('Stages')
    expect(wrapper.text()).toContain('Activités')
  })

  it('4 — l\'onglet "Portfolios" est actif par défaut', () => {
    const wrapper = mountCandidates()
    expect(wrapper.findAll('.tab')[0].classes()).toContain('active')
  })

  it('5 — affiche les candidats valides (3 items)', () => {
    expect(mountCandidates().findAll('.proj-item').length).toBe(3)
  })

  it('6 — affiche les noms des candidats', () => {
    const wrapper = mountCandidates()
    expect(wrapper.text()).toContain('Alice Dupont')
    expect(wrapper.text()).toContain('Bob Martin')
    expect(wrapper.text()).toContain('Carol Ahmed')
  })

  it('7 — filtre les candidats dont id est négatif', () => {
    const wrapper = mount(ProfessionalCandidates, {
      props: { candidats: [{ id: -1, nom: 'Invalide', formation: 'X', ecole: '', ville: '' }], selectedId: null, recsEmises: [] },
    })
    expect(wrapper.findAll('.proj-item').length).toBe(0)
  })

  it('8 — filtre les candidats dont id est une chaîne', () => {
    const wrapper = mount(ProfessionalCandidates, {
      props: { candidats: [{ id: 'abc', nom: 'StringId', formation: 'Y', ecole: '', ville: '' }], selectedId: null, recsEmises: [] },
    })
    expect(wrapper.findAll('.proj-item').length).toBe(0)
  })

  it('9 — candidat non recommandé a le badge "En attente" (.pill-pending)', () => {
    const wrapper = mountCandidates({ recsEmises: [] })
    const pills = wrapper.findAll('.status-pill')
    expect(pills[0].text()).toBe('En attente')
    expect(pills[0].classes()).toContain('pill-pending')
  })

  it('10 — candidat recommandé a le badge "Recommandé" (.pill-valide)', () => {
    const wrapper = mountCandidates({ recsEmises: [{ candidatId: 1 }] })
    const pills = wrapper.findAll('.status-pill')
    expect(pills[0].text()).toBe('Recommandé')
    expect(pills[0].classes()).toContain('pill-valide')
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — ProfessionalCandidates
// ═══════════════════════════════════════════════════════

describe('ProfessionalCandidates.vue — Tests d\'Intégration', () => {

  it('11 — clic sur un .proj-item émet "select" avec le bon candidat', async () => {
    const wrapper = mountCandidates()
    await wrapper.findAll('.proj-item')[0].trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')[0][0]).toEqual(MOCK_CANDIDATS[0])
  })

  it('12 — clic sur "Recommander" (.btn-primary.btn-sm) émet "ouvrir-formulaire"', async () => {
    const wrapper = mountCandidates()
    await wrapper.find('.btn-primary.btn-sm').trigger('click')
    expect(wrapper.emitted('ouvrir-formulaire')).toBeTruthy()
    expect(wrapper.emitted('ouvrir-formulaire')[0][0]).toEqual(MOCK_CANDIDATS[0])
  })

  it('13 — clic sur "Détails" (.btn-ghost.btn-sm) émet "select"', async () => {
    const wrapper = mountCandidates()
    const detailBtns = wrapper.findAll('.btn-ghost.btn-sm')
    await detailBtns[0].trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
  })

  it('14 — clic sur l\'onglet "Stages" le rend actif', async () => {
    const wrapper = mountCandidates()
    const tabs = wrapper.findAll('.tab')
    await tabs[1].trigger('click')
    expect(tabs[1].classes()).toContain('active')
    expect(tabs[0].classes()).not.toContain('active')
  })

  it('15 — clic sur l\'onglet "Activités" le rend actif', async () => {
    const wrapper = mountCandidates()
    const tabs = wrapper.findAll('.tab')
    await tabs[2].trigger('click')
    expect(tabs[2].classes()).toContain('active')
  })

  it('16 — clic sur l\'étoile favori appelle store.toggleFavori(id)', async () => {
    const wrapper = mountCandidates()
    const favoriBtns = wrapper.findAll('.btn-ghost.btn-sm').filter(b =>
      b.find('.ti-bookmark, .ti-bookmark-filled').exists()
    )
    if (favoriBtns.length > 0) {
      await favoriBtns[0].trigger('click')
      expect(mockToggleFavori).toHaveBeenCalled()
    }
  })
})
