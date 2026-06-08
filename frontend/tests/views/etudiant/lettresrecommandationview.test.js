import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/api.js', () => ({
  default: {
    get:    vi.fn(),
    post:   vi.fn(),
    put:    vi.fn(),
    delete: vi.fn(),
    interceptors: { response: { use: vi.fn() } },
  }
}))

vi.mock('@/stores/authstore.js', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id_utilisateur: 'u1', id: 'u1' },
    fetchUser: vi.fn(),
  }))
}))

import Recommendations from '@/views/Etudiant/Recommendations.vue'
import api from '@/api.js'

function mountView() {
  return mount(Recommendations, {
    global: { plugins: [createPinia()] }
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  api.get.mockResolvedValue({ data: { data: [] } })
})

describe('Recommendations.vue — rendu initial', () => {
  it('affiche le titre de la page', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('Recommandations')
  })

  it('affiche les cartes de statistiques', () => {
    const wrapper = mountView()
    const statCards = wrapper.findAll('.stat-card')
    expect(statCards.length).toBeGreaterThan(0)
  })

  it('affiche le label TOTAL REÇUES', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('TOTAL REÇUES')
  })

  it('affiche le label VALIDÉES', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('VALIDÉES')
  })

  it('affiche le label EN ATTENTE', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('EN ATTENTE')
  })
})

describe('Recommendations.vue — stats initiales', () => {
  it('affiche des compteurs à 0 avant chargement', () => {
    const wrapper = mountView()
    const values = wrapper.findAll('.stat-value')
    values.forEach(v => expect(v.text()).toBe('0'))
  })
})
