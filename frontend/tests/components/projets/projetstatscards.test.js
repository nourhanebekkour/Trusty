import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjetStatsCards from '@/components/projets/projetStatsCards.vue'

const STATS = { total: 10, valides: 4, enAttente: 5, avecRapport: 2 }

describe('ProjetStatsCards.vue — rendu', () => {
  it('affiche 4 cartes de statistiques', () => {
    const wrapper = mount(ProjetStatsCards, { props: { stats: STATS } })
    expect(wrapper.findAll('.stat-card')).toHaveLength(4)
  })

  it('affiche le label TOTAL PROJETS', () => {
    const wrapper = mount(ProjetStatsCards, { props: { stats: STATS } })
    expect(wrapper.text()).toContain('TOTAL PROJETS')
  })

  it('affiche le label VALIDÉS', () => {
    const wrapper = mount(ProjetStatsCards, { props: { stats: STATS } })
    expect(wrapper.text()).toContain('VALIDÉS')
  })

  it('affiche le label EN ATTENTE', () => {
    const wrapper = mount(ProjetStatsCards, { props: { stats: STATS } })
    expect(wrapper.text()).toContain('EN ATTENTE')
  })

  it('affiche les valeurs correctes', () => {
    const wrapper = mount(ProjetStatsCards, { props: { stats: STATS } })
    const values = wrapper.findAll('.stat-value')
    expect(values[0].text()).toBe('10')
    expect(values[1].text()).toBe('4')
    expect(values[2].text()).toBe('5')
  })

  it('affiche 0 pour toutes les stats si vides', () => {
    const wrapper = mount(ProjetStatsCards, { props: { stats: { total: 0, valides: 0, enAttente: 0, avecRapport: 0 } } })
    const values = wrapper.findAll('.stat-value')
    values.forEach(v => expect(v.text()).toBe('0'))
  })
})
