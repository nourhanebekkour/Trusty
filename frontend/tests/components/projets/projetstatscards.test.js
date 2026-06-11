import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjetStatsCards from '@/components/projets/projetStatsCards.vue'

const STATS = { total: 10, valides: 4, enAttente: 5 }

describe('ProjetStatsCards.vue — rendu', () => {
  it('affiche 3 cartes de statistiques', () => {
    const wrapper = mount(ProjetStatsCards, { props: { stats: STATS } })
    expect(wrapper.findAll('.stat-card')).toHaveLength(3)
  })

  it('affiche le label Total Projets', () => {
    const wrapper = mount(ProjetStatsCards, { props: { stats: STATS } })
    expect(wrapper.text()).toContain('Total Projets')
  })

  it('affiche le label Validés', () => {
    const wrapper = mount(ProjetStatsCards, { props: { stats: STATS } })
    expect(wrapper.text()).toContain('Validés')
  })

  it('affiche le label En attente', () => {
    const wrapper = mount(ProjetStatsCards, { props: { stats: STATS } })
    expect(wrapper.text()).toContain('En attente')
  })

  it('affiche les valeurs correctes', () => {
    const wrapper = mount(ProjetStatsCards, { props: { stats: STATS } })
    const values = wrapper.findAll('.stat-value')
    expect(values[0].text()).toBe('10')
    expect(values[1].text()).toBe('4')
    expect(values[2].text()).toBe('5')
  })

  it('affiche 0 pour toutes les stats si vides', () => {
    const wrapper = mount(ProjetStatsCards, { props: { stats: { total: 0, valides: 0, enAttente: 0 } } })
    const values = wrapper.findAll('.stat-value')
    values.forEach(v => expect(v.text()).toBe('0'))
  })
})
