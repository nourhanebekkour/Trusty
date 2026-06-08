import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfessorStats from '@/components/professor/ProfessorStats.vue'

describe('ProfessorStats.vue — rendu', () => {
  it('affiche les 4 cartes de stat', () => {
    const wrapper = mount(ProfessorStats, {
      props: { enAttente: 3, valides: 5, etudiantsSuivis: 12, stagesEnCours: 2 }
    })
    expect(wrapper.findAll('.stat-card')).toHaveLength(4)
  })

  it('affiche les labels', () => {
    const wrapper = mount(ProfessorStats, {
      props: { enAttente: 0, valides: 0, etudiantsSuivis: 0, stagesEnCours: 0 }
    })
    expect(wrapper.text()).toContain('En attente')
    expect(wrapper.text()).toContain('Validés')
    expect(wrapper.text()).toContain('Étudiants suivis')
    expect(wrapper.text()).toContain('Stages en cours')
  })

  it('affiche les valeurs passées en props', () => {
    const wrapper = mount(ProfessorStats, {
      props: { enAttente: 3, valides: 5, etudiantsSuivis: 12, stagesEnCours: 2 }
    })
    expect(wrapper.text()).toContain('3')
    expect(wrapper.text()).toContain('5')
    expect(wrapper.text()).toContain('12')
    expect(wrapper.text()).toContain('2')
  })

  it('affiche 0 par défaut si aucune prop passée', () => {
    const wrapper = mount(ProfessorStats, { props: {} })
    const values = wrapper.findAll('.stat-card-value')
    values.forEach(v => expect(v.text()).toBe('0'))
  })
})
