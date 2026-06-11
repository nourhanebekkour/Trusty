import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

const mockStore = {
  loading: false,
  error: null,
  filteredActivites: [],
  fetchActivites: vi.fn(),
  removeAttestation: vi.fn(),
}

vi.mock('@/stores/activitesStore', () => ({
  useActivitesStore: vi.fn(() => mockStore)
}))

vi.mock('@/stores/authstore.js', () => ({
  useAuthStore: vi.fn(() => ({ user: { id_etudiant: 'e1' } }))
}))

import Activites from '@/views/Etudiant/activites.vue'

function mountView(overrides = {}) {
  Object.assign(mockStore, {
    loading: false,
    error: null,
    filteredActivites: [],
    fetchActivites: vi.fn(),
    removeAttestation: vi.fn(),
    ...overrides,
  })
  return mount(Activites, {
    global: {
      plugins: [createPinia()],
      stubs: {
        StatsCards: { template: '<div class="stats-cards-stub" />' },
        FilterTabs: { template: '<div class="filter-tabs-stub" />', emits: ['sort'] },
        ActiviteCard: { template: '<div class="activite-card-stub" />', props: ['activite'] },
        ActiviteModal: { template: '<div class="activite-modal-stub" />' },
      }
    }
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('Activites.vue — rendu initial', () => {
  it('affiche le titre de la page', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('Activités Parascolaires')
  })

  it('affiche le bouton Ajouter une activité', () => {
    const wrapper = mountView()
    expect(wrapper.find('.add-btn').exists()).toBe(true)
  })

  it('affiche l\'état vide si filteredActivites est vide', () => {
    const wrapper = mountView({ filteredActivites: [] })
    expect(wrapper.find('.empty-state').exists()).toBe(true)
  })

  it('affiche le spinner si loading est true', () => {
    const wrapper = mountView({ loading: true })
    expect(wrapper.find('.loading-state').exists()).toBe(true)
  })
})

describe('Activites.vue — liste d\'activités', () => {
  it('affiche une activite-card pour chaque activité', () => {
    const wrapper = mountView({
      filteredActivites: [
        { id: '1', nom: 'Club Robotique', type: 'CLUB' },
        { id: '2', nom: 'Handball',        type: 'SPORT' },
      ]
    })
    const cards = wrapper.findAll('.activite-card-stub')
    expect(cards).toHaveLength(2)
  })
})

describe('Activites.vue — modal', () => {
  it('showModal passe à true au clic sur Ajouter', async () => {
    const wrapper = mountView()
    await wrapper.find('.add-btn').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.showModal).toBe(true)
  })
})
