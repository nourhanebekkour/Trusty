import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import StatsCards from '@/components/activites/StatsCards.vue'

vi.mock('@/stores/activitesStore', () => ({
  useActivitesStore: vi.fn(),
}))

import { useActivitesStore } from '@/stores/activitesStore'

function makeMockStore(overrides = {}) {
  return {
    totalActivites:  0,
    validees:        0,
    enAttente:       0,
    avecAttestation: 0,
    activeFilter:    'Toutes',
    setFilter:       vi.fn(),
    ...overrides,
  }
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  useActivitesStore.mockReturnValue(makeMockStore())
})

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — StatsCards
// ═══════════════════════════════════════════════════════

describe('StatsCards.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    const wrapper = mount(StatsCards)
    expect(wrapper.find('.stats-grid').exists()).toBe(true)
  })

  it('2 — affiche exactement 4 cartes .stat-card', () => {
    expect(mount(StatsCards).findAll('.stat-card').length).toBe(4)
  })

  it('3 — affiche le label "TOTAL" dans la 1ère carte', () => {
    const labels = mount(StatsCards).findAll('.stat-label')
    expect(labels[0].text()).toBe('TOTAL')
  })

  it('4 — affiche le label "VALIDÉES" dans la 2ème carte', () => {
    const labels = mount(StatsCards).findAll('.stat-label')
    expect(labels[1].text()).toBe('VALIDÉES')
  })

  it('5 — affiche le label "EN ATTENTE" dans la 3ème carte', () => {
    const labels = mount(StatsCards).findAll('.stat-label')
    expect(labels[2].text()).toBe('EN ATTENTE')
  })

  it('6 — affiche le label "AVEC ATTESTATION" dans la 4ème carte', () => {
    const labels = mount(StatsCards).findAll('.stat-label')
    expect(labels[3].text()).toBe('AVEC ATTESTATION')
  })

  it('7 — affiche 0 dans toutes les cartes par défaut', () => {
    mount(StatsCards).findAll('.stat-value').forEach(v => expect(v.text()).toBe('0'))
  })

  it('8 — chaque carte contient une icône SVG', () => {
    const icons = mount(StatsCards).findAll('.stat-icon')
    expect(icons.length).toBe(4)
    icons.forEach(icon => expect(icon.find('svg').exists()).toBe(true))
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — StatsCards (valeurs du store)
// ═══════════════════════════════════════════════════════

describe('StatsCards.vue — Tests d\'Intégration (réactivité store)', () => {

  it('9 — affiche totalActivites = 8 dans la 1ère carte', () => {
    useActivitesStore.mockReturnValue(makeMockStore({ totalActivites: 8 }))
    const values = mount(StatsCards).findAll('.stat-value')
    expect(values[0].text()).toBe('8')
  })

  it('10 — affiche validees = 5 dans la 2ème carte', () => {
    useActivitesStore.mockReturnValue(makeMockStore({ validees: 5 }))
    const values = mount(StatsCards).findAll('.stat-value')
    expect(values[1].text()).toBe('5')
  })

  it('11 — affiche enAttente = 2 dans la 3ème carte', () => {
    useActivitesStore.mockReturnValue(makeMockStore({ enAttente: 2 }))
    const values = mount(StatsCards).findAll('.stat-value')
    expect(values[2].text()).toBe('2')
  })

  it('12 — affiche avecAttestation = 3 dans la 4ème carte', () => {
    useActivitesStore.mockReturnValue(makeMockStore({ avecAttestation: 3 }))
    const values = mount(StatsCards).findAll('.stat-value')
    expect(values[3].text()).toBe('3')
  })

  it('13 — affiche des valeurs cohérentes (total >= validees)', () => {
    useActivitesStore.mockReturnValue(makeMockStore({
      totalActivites: 10, validees: 6, enAttente: 4, avecAttestation: 3,
    }))
    const values = mount(StatsCards).findAll('.stat-value')
    expect(Number(values[0].text())).toBeGreaterThanOrEqual(Number(values[1].text()))
  })
})
