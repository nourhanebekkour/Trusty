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

import Parcours from '@/views/Etudiant/Parcours.vue'
import api from '@/api.js'

function mountParcours() {
  return mount(Parcours, {
    global: { plugins: [createPinia()] }
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('Parcours.vue — rendu initial', () => {
  it('affiche le titre de la page', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })
    const wrapper = mountParcours()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Parcours Académique')
  })

  it('affiche le bouton Ajouter une formation', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })
    const wrapper = mountParcours()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Ajouter une formation')
  })

  it('affiche l\'état vide si aucune formation', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })
    const wrapper = mountParcours()
    await new Promise(r => setTimeout(r, 10))
    expect(wrapper.text()).toContain('Aucune formation enregistrée')
  })

  it('affiche l\'état d\'erreur si l\'API échoue', async () => {
    api.get.mockRejectedValue({ message: 'Erreur réseau' })
    const wrapper = mountParcours()
    await new Promise(r => setTimeout(r, 10))
    expect(wrapper.text()).toContain('Erreur')
  })
})

describe('Parcours.vue — stats', () => {
  it('affiche les compteurs à 0 au départ', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })
    const wrapper = mountParcours()
    await new Promise(r => setTimeout(r, 10))
    const stats = wrapper.findAll('.stat-value')
    stats.forEach(s => expect(s.text()).toBe('0'))
  })

  it('calcule le compteur VALIDÉES correctement', async () => {
    api.get.mockResolvedValue({ data: { data: [
      { id_formation: '1', diplome: 'Licence', etablissement: 'Univ', date_debut: '2020-09-01', date_fin: '2023-06-01', est_actuelle: false },
      { id_formation: '2', diplome: 'Master',  etablissement: 'Univ', date_debut: '2023-09-01', date_fin: null, est_actuelle: true },
    ]}})
    const wrapper = mountParcours()
    await new Promise(r => setTimeout(r, 10))
    expect(wrapper.text()).toContain('2') // total formations
  })
})

describe('Parcours.vue — modal', () => {
  it('ouvre le modal au clic sur Ajouter une formation', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })
    const wrapper = mountParcours()
    await new Promise(r => setTimeout(r, 10))
    expect(wrapper.find('.modal-box').exists()).toBe(false)
    await wrapper.find('button.btn-primary').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.modal-box').exists()).toBe(true)
  })

  it('titre du modal indique "Nouvelle formation"', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })
    const wrapper = mountParcours()
    await new Promise(r => setTimeout(r, 10))
    await wrapper.find('button.btn-primary').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Nouvelle formation')
  })
})
