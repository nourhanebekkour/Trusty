import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import FilterTabs from '@/components/activites/FilterTabs.vue'

vi.mock('@/stores/activitesStore', () => ({
  useActivitesStore: vi.fn(),
}))

import { useActivitesStore } from '@/stores/activitesStore'

let mockSetFilter

function makeMockStore(activeFilter = 'Toutes') {
  mockSetFilter = vi.fn((f) => { store.activeFilter = f })
  const store = { activeFilter, setFilter: mockSetFilter }
  return store
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  useActivitesStore.mockReturnValue(makeMockStore())
})

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — FilterTabs
// ═══════════════════════════════════════════════════════

describe('FilterTabs.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    const wrapper = mount(FilterTabs)
    expect(wrapper.find('.filter-bar').exists()).toBe(true)
  })

  it('2 — affiche le label "Mes activités"', () => {
    expect(mount(FilterTabs).find('.filter-label').text()).toBe('Mes activités')
  })

  it('3 — affiche exactement 6 onglets .filter-tab', () => {
    expect(mount(FilterTabs).findAll('.filter-tab').length).toBe(6)
  })

  it('4 — affiche l\'onglet "Toutes"', () => {
    expect(mount(FilterTabs).text()).toContain('Toutes')
  })

  it('5 — affiche l\'onglet "Club"', () => {
    expect(mount(FilterTabs).text()).toContain('Club')
  })

  it('6 — affiche l\'onglet "Événement"', () => {
    expect(mount(FilterTabs).text()).toContain('Événement')
  })

  it('7 — affiche l\'onglet "Hackathon"', () => {
    expect(mount(FilterTabs).text()).toContain('Hackathon')
  })

  it('8 — affiche l\'onglet "Compétition"', () => {
    expect(mount(FilterTabs).text()).toContain('Compétition')
  })

  it('9 — affiche l\'onglet "Engagement"', () => {
    expect(mount(FilterTabs).text()).toContain('Engagement')
  })

  it('10 — affiche le bouton "Trier par date"', () => {
    const wrapper = mount(FilterTabs)
    expect(wrapper.find('.sort-btn').exists()).toBe(true)
    expect(wrapper.text()).toContain('Trier par date')
  })

  it('11 — l\'onglet "Toutes" est actif par défaut (activeFilter = "Toutes")', () => {
    const wrapper = mount(FilterTabs)
    const tabs = wrapper.findAll('.filter-tab')
    expect(tabs[0].classes()).toContain('active')
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — FilterTabs
// ═══════════════════════════════════════════════════════

describe('FilterTabs.vue — Tests d\'Intégration', () => {

  it('12 — clic sur "Club" appelle store.setFilter("Club")', async () => {
    const wrapper = mount(FilterTabs)
    const tabs = wrapper.findAll('.filter-tab')
    await tabs[1].trigger('click')
    expect(mockSetFilter).toHaveBeenCalledWith('Club')
  })

  it('13 — clic sur "Hackathon" appelle store.setFilter("Hackathon")', async () => {
    const wrapper = mount(FilterTabs)
    const tabs = wrapper.findAll('.filter-tab')
    await tabs[3].trigger('click')
    expect(mockSetFilter).toHaveBeenCalledWith('Hackathon')
  })

  it('14 — clic sur "Toutes" appelle store.setFilter("Toutes")', async () => {
    const wrapper = mount(FilterTabs)
    const tabs = wrapper.findAll('.filter-tab')
    await tabs[0].trigger('click')
    expect(mockSetFilter).toHaveBeenCalledWith('Toutes')
  })

  it('15 — clic sur le bouton de tri émet "sort"', async () => {
    const wrapper = mount(FilterTabs)
    await wrapper.find('.sort-btn').trigger('click')
    expect(wrapper.emitted('sort')).toBeTruthy()
  })

  it('16 — plusieurs clics sur des filtres différents appellent setFilter à chaque fois', async () => {
    const wrapper = mount(FilterTabs)
    const tabs = wrapper.findAll('.filter-tab')
    await tabs[1].trigger('click')
    await tabs[2].trigger('click')
    await tabs[3].trigger('click')
    expect(mockSetFilter).toHaveBeenCalledTimes(3)
    expect(mockSetFilter).toHaveBeenNthCalledWith(1, 'Club')
    expect(mockSetFilter).toHaveBeenNthCalledWith(2, 'Événement')
    expect(mockSetFilter).toHaveBeenNthCalledWith(3, 'Hackathon')
  })
})
