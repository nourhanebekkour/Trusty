import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfessorInternships from '@/components/professor/ProfessorInternships.vue'

const STAGES = [
  { id: '1', entreprise: 'ENSA Maroc',  etudiant: 'Alice Martin', role: 'Développeur', dates: 'jan–juin 2024', status: 'valide',  statusLabel: 'Validé',     progress: 100, color: '#22c55e', note: 'Excellent' },
  { id: '2', entreprise: 'OCP Group',   etudiant: 'Bob Dupont',   role: 'Data Analyst', dates: 'fév–août 2024', status: 'pending', statusLabel: 'En attente', progress: 40,  color: '#f59e0b', note: 'En cours' },
]

describe('ProfessorInternships.vue — rendu', () => {
  it('affiche le titre Stages supervisés', () => {
    const wrapper = mount(ProfessorInternships, { props: { stages: [] } })
    expect(wrapper.text()).toContain('Stages supervisés')
  })

  it('n\'affiche rien si la liste est vide', () => {
    const wrapper = mount(ProfessorInternships, { props: { stages: [] } })
    expect(wrapper.findAll('.stage-row')).toHaveLength(0)
  })

  it('affiche un stage-row par stage', () => {
    const wrapper = mount(ProfessorInternships, { props: { stages: STAGES } })
    expect(wrapper.findAll('.stage-row')).toHaveLength(2)
  })

  it('affiche l\'entreprise et l\'étudiant', () => {
    const wrapper = mount(ProfessorInternships, { props: { stages: STAGES } })
    expect(wrapper.text()).toContain('ENSA Maroc')
    expect(wrapper.text()).toContain('Alice Martin')
    expect(wrapper.text()).toContain('OCP Group')
  })

  it('affiche les labels de statut', () => {
    const wrapper = mount(ProfessorInternships, { props: { stages: STAGES } })
    expect(wrapper.text()).toContain('Validé')
    expect(wrapper.text()).toContain('En attente')
  })

  it('affiche le séparateur entre les stages', () => {
    const wrapper = mount(ProfessorInternships, { props: { stages: STAGES } })
    expect(wrapper.find('hr.divider').exists()).toBe(true)
  })

  it('n\'affiche pas de séparateur si un seul stage', () => {
    const wrapper = mount(ProfessorInternships, { props: { stages: [STAGES[0]] } })
    expect(wrapper.find('hr.divider').exists()).toBe(false)
  })
})
