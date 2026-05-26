import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StageStats from '@/components/stages/StageStats.vue'

const STATS = { total: 5, valides: 3, enAttente: 2 }

function mountStats(stats = STATS) {
  return mount(StageStats, { props: { stats } })
}

// ═════════════════════════════════════════════════════════════
// TESTS UNITAIRES — StageStats
// ═════════════════════════════════════════════════════════════

describe('StageStats.vue — Tests Unitaires', () => {

  it('1 — affiche le total des stages', () => {
    const wrapper = mountStats()
    expect(wrapper.text()).toContain('5')
  })

  it('2 — affiche le nombre de stages validés', () => {
    const wrapper = mountStats()
    expect(wrapper.text()).toContain('3')
  })

  it('3 — affiche le nombre de stages en attente', () => {
    const wrapper = mountStats()
    expect(wrapper.text()).toContain('2')
  })

  it('4 — affiche 3 cartes stat', () => {
    const wrapper = mountStats()
    expect(wrapper.findAll('.stat-card').length).toBe(3)
  })

  it('5 — affiche le label "Total des Stages"', () => {
    const wrapper = mountStats()
    expect(wrapper.text()).toContain('Total des Stages')
  })

  it('6 — affiche le label "Stages Validés"', () => {
    const wrapper = mountStats()
    expect(wrapper.text()).toContain('Stages Validés')
  })

  it('7 — affiche le label "En attente"', () => {
    const wrapper = mountStats()
    expect(wrapper.text()).toContain('En attente')
  })

  it('8 — affiche 0 si stats sont à zéro', () => {
    const wrapper = mountStats({ total: 0, valides: 0, enAttente: 0 })
    const values = wrapper.findAll('.stat-value')
    values.forEach(v => expect(v.text()).toBe('0'))
  })

  it('9 — met à jour l\'affichage quand les props changent', async () => {
    const wrapper = mountStats({ total: 1, valides: 1, enAttente: 0 })
    await wrapper.setProps({ stats: { total: 10, valides: 7, enAttente: 3 } })
    expect(wrapper.text()).toContain('10')
    expect(wrapper.text()).toContain('7')
  })
})
