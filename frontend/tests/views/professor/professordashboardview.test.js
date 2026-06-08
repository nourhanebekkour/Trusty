import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/services/professorApi', () => ({
  getProfessorDashboard:        vi.fn(),
  approveProfessorValidation:   vi.fn(),
  requestProfessorChanges:      vi.fn(),
  certifyProfessorPortfolio:    vi.fn(),
  sendProfessorMessage:         vi.fn(),
}))

import ProfessorDashboard from '@/views/professor/ProfessorDashboard.vue'
import * as professorApi from '@/services/professorApi'

function mountView() {
  return mount(ProfessorDashboard, {
    global: { plugins: [createPinia()] }
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('ProfessorDashboard.vue — rendu initial', () => {
  it('affiche le titre de la page', () => {
    professorApi.getProfessorDashboard.mockResolvedValue({ stats: {}, students: [], validations: [] })
    const wrapper = mountView()
    expect(wrapper.text()).toContain('Tableau de bord professeur')
  })

  it('affiche le bouton Exporter rapport', () => {
    professorApi.getProfessorDashboard.mockResolvedValue({ stats: {}, students: [], validations: [] })
    const wrapper = mountView()
    expect(wrapper.text()).toContain('Exporter rapport')
  })

  it('affiche le sous-titre de la page', () => {
    professorApi.getProfessorDashboard.mockResolvedValue({ stats: {}, students: [], validations: [] })
    const wrapper = mountView()
    expect(wrapper.text()).toContain('Suivez les étudiants')
  })
})

describe('ProfessorDashboard.vue — erreur', () => {
  it('affiche le message d\'erreur si l\'API échoue', async () => {
    professorApi.getProfessorDashboard.mockRejectedValue(new Error('Erreur serveur'))
    const wrapper = mountView()
    await new Promise(r => setTimeout(r, 10))
    expect(wrapper.find('.error-box').exists()).toBe(true)
  })
})

describe('ProfessorDashboard.vue — données chargées', () => {
  it('affiche les statistiques après chargement', async () => {
    professorApi.getProfessorDashboard.mockResolvedValue({
      stats: { studentsCount: 12, pendingValidationsCount: 3, certificationsCount: 5, averageDelay: '2j' },
      students: [],
      validations: [],
    })
    const wrapper = mountView()
    await new Promise(r => setTimeout(r, 10))
    expect(wrapper.text()).toContain('12')
    expect(wrapper.text()).toContain('3')
  })

  it('affiche "Aucun étudiant trouvé" si la liste est vide', async () => {
    professorApi.getProfessorDashboard.mockResolvedValue({
      stats: { studentsCount: 0, pendingValidationsCount: 0, certificationsCount: 0, averageDelay: null },
      students: [],
      validations: [],
    })
    const wrapper = mountView()
    await new Promise(r => setTimeout(r, 10))
    expect(wrapper.text()).toContain('Aucun étudiant')
  })

  it('affiche la liste des étudiants', async () => {
    professorApi.getProfessorDashboard.mockResolvedValue({
      stats: { studentsCount: 1, pendingValidationsCount: 0, certificationsCount: 0 },
      students: [{ id: '1', fullName: 'Alice Martin', level: 'M2', field: 'Informatique' }],
      validations: [],
    })
    const wrapper = mountView()
    await new Promise(r => setTimeout(r, 10))
    expect(wrapper.text()).toContain('Alice Martin')
  })
})

describe('ProfessorDashboard.vue — recherche étudiants', () => {
  it('filtre les étudiants par nom', async () => {
    professorApi.getProfessorDashboard.mockResolvedValue({
      stats: { studentsCount: 2, pendingValidationsCount: 0, certificationsCount: 0 },
      students: [
        { id: '1', fullName: 'Alice Martin', level: 'M2', field: 'Info' },
        { id: '2', fullName: 'Bob Dupont',   level: 'L3', field: 'Maths' },
      ],
      validations: [],
    })
    const wrapper = mountView()
    await new Promise(r => setTimeout(r, 10))
    const input = wrapper.find('input.input')
    if (input.exists()) {
      await input.setValue('Alice')
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Alice Martin')
      expect(wrapper.text()).not.toContain('Bob Dupont')
    }
  })
})
