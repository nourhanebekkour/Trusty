import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfessorProjects from '@/components/professor/ProfessorProjects.vue'

const PROJETS = [
  { id: '1', nom: 'Projet Alpha', etudiant: 'Alice Martin', context: 'M2 Informatique', date: '2024-01-15', description: 'Appli web', status: 'pending', statusLabel: 'En attente', statusColor: '#f59e0b', progress: 50, color: 'blue', icon: 'code' },
  { id: '2', nom: 'Projet Beta',  etudiant: 'Bob Dupont',   context: 'L3 Math',          date: '2024-02-01', description: 'Algo',       status: 'valide',  statusLabel: 'Validé',     statusColor: '#22c55e', progress: 100, color: 'green', icon: 'check' },
]

describe('ProfessorProjects.vue — rendu', () => {
  it('affiche le titre Éléments à valider', () => {
    const wrapper = mount(ProfessorProjects, { props: { projets: [] } })
    expect(wrapper.text()).toContain('Éléments à valider')
  })

  it('affiche les onglets Projets / Stages / Activités', () => {
    const wrapper = mount(ProfessorProjects, { props: { projets: [] } })
    expect(wrapper.text()).toContain('Projets')
    expect(wrapper.text()).toContain('Stages')
    expect(wrapper.text()).toContain('Activités')
  })

  it('affiche un item par projet', () => {
    const wrapper = mount(ProfessorProjects, { props: { projets: PROJETS } })
    expect(wrapper.findAll('.proj-item')).toHaveLength(2)
  })

  it('affiche le nom et l\'étudiant de chaque projet', () => {
    const wrapper = mount(ProfessorProjects, { props: { projets: PROJETS } })
    expect(wrapper.text()).toContain('Projet Alpha')
    expect(wrapper.text()).toContain('Alice Martin')
  })

  it('affiche le bouton Valider uniquement pour les projets pending', () => {
    const wrapper = mount(ProfessorProjects, { props: { projets: PROJETS } })
    const validerBtns = wrapper.findAll('button.btn-primary')
    expect(validerBtns).toHaveLength(1)
    expect(validerBtns[0].text()).toContain('Valider')
  })

  it('affiche le bouton Certifier pour les projets validés', () => {
    const wrapper = mount(ProfessorProjects, { props: { projets: PROJETS } })
    expect(wrapper.text()).toContain('Certifier')
  })
})

describe('ProfessorProjects.vue — émission d\'événements', () => {
  it('émet "valider" avec le projet au clic sur Valider', async () => {
    const wrapper = mount(ProfessorProjects, { props: { projets: PROJETS } })
    const validerBtn = wrapper.find('button.btn-primary')
    await validerBtn.trigger('click')
    expect(wrapper.emitted('valider')).toBeTruthy()
    expect(wrapper.emitted('valider')[0][0].id).toBe('1')
  })
})

describe('ProfessorProjects.vue — onglets', () => {
  it('l\'onglet Projets est actif par défaut', () => {
    const wrapper = mount(ProfessorProjects, { props: { projets: [] } })
    const activeTab = wrapper.find('.tab.active')
    expect(activeTab.text()).toBe('Projets')
  })

  it('change l\'onglet actif au clic', async () => {
    const wrapper = mount(ProfessorProjects, { props: { projets: [] } })
    const tabs = wrapper.findAll('.tab')
    await tabs[1].trigger('click')
    const activeTab = wrapper.find('.tab.active')
    expect(activeTab.text()).toBe('Stages')
  })
})
