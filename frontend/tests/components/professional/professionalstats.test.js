import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfessionalStats from '@/components/Professional/ProfessionalStats.vue'

const MOCK_STATS = {
  candidatsEnAttente: 5,
  totalRecs: 12,
  consultes: 8,
  favorisCount: 3,
}

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — ProfessionalStats
// ═══════════════════════════════════════════════════════

describe('ProfessionalStats.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    const wrapper = mount(ProfessionalStats, { props: MOCK_STATS })
    expect(wrapper.exists()).toBe(true)
  })

  it('2 — affiche exactement 4 cartes de statistiques', () => {
    const wrapper = mount(ProfessionalStats, { props: MOCK_STATS })
    expect(wrapper.findAll('.stat-card').length).toBe(4)
  })

  it('3 — affiche le label "En attente"', () => {
    const wrapper = mount(ProfessionalStats, { props: MOCK_STATS })
    expect(wrapper.text()).toContain('En attente')
  })

  it('4 — affiche le label "Recommandations émises"', () => {
    const wrapper = mount(ProfessionalStats, { props: MOCK_STATS })
    expect(wrapper.text()).toContain('Recommandations émises')
  })

  it('5 — affiche le label "Portfolios consultés"', () => {
    const wrapper = mount(ProfessionalStats, { props: MOCK_STATS })
    expect(wrapper.text()).toContain('Portfolios consultés')
  })

  it('6 — affiche le label "Favoris sauvés"', () => {
    const wrapper = mount(ProfessionalStats, { props: MOCK_STATS })
    expect(wrapper.text()).toContain('Favoris sauvés')
  })

  it('7 — affiche la valeur candidatsEnAttente dans la 1ère carte', () => {
    const wrapper = mount(ProfessionalStats, { props: MOCK_STATS })
    expect(wrapper.findAll('.stat-value')[0].text()).toBe('5')
  })

  it('8 — affiche la valeur totalRecs dans la 2ème carte', () => {
    const wrapper = mount(ProfessionalStats, { props: MOCK_STATS })
    expect(wrapper.findAll('.stat-value')[1].text()).toBe('12')
  })

  it('9 — affiche la valeur consultes dans la 3ème carte', () => {
    const wrapper = mount(ProfessionalStats, { props: MOCK_STATS })
    expect(wrapper.findAll('.stat-value')[2].text()).toBe('8')
  })

  it('10 — affiche la valeur favorisCount dans la 4ème carte', () => {
    const wrapper = mount(ProfessionalStats, { props: MOCK_STATS })
    expect(wrapper.findAll('.stat-value')[3].text()).toBe('3')
  })

  it('11 — valeurs par défaut à 0 si aucune prop passée', () => {
    const wrapper = mount(ProfessionalStats)
    wrapper.findAll('.stat-value').forEach(v => expect(v.text()).toBe('0'))
  })

  it('12 — la première carte a la classe "active"', () => {
    const wrapper = mount(ProfessionalStats, { props: MOCK_STATS })
    expect(wrapper.findAll('.stat-card')[0].classes()).toContain('active')
  })

  it('13 — les autres cartes n\'ont pas la classe "active"', () => {
    const wrapper = mount(ProfessionalStats, { props: MOCK_STATS })
    const cards = wrapper.findAll('.stat-card')
    for (let i = 1; i < cards.length; i++) {
      expect(cards[i].classes()).not.toContain('active')
    }
  })
})
