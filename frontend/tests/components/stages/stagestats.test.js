import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StageStats from '@/components/stages/StageStats.vue'

const STATS = { total: 5, valides: 3, enAttente: 2, avecRapport: 1 }

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

  it('4 — affiche 4 cartes stat', () => {
    const wrapper = mountStats()
    expect(wrapper.findAll('.stat-card').length).toBe(4)
  })

  it('5 — affiche le label "TOTAL DES STAGES"', () => {
    const wrapper = mountStats()
    expect(wrapper.text()).toContain('TOTAL DES STAGES')
  })

  it('6 — affiche le label "STAGES VALIDÉS"', () => {
    const wrapper = mountStats()
    expect(wrapper.text()).toContain('STAGES VALIDÉS')
  })

  it('7 — affiche le label "EN ATTENTE"', () => {
    const wrapper = mountStats()
    expect(wrapper.text()).toContain('EN ATTENTE')
  })

  it('8 — affiche 0 si stats sont à zéro', () => {
    const wrapper = mountStats({ total: 0, valides: 0, enAttente: 0, avecRapport: 0 })
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
