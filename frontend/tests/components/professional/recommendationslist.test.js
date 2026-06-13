import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RecommendationsList from '@/components/Professional/RecommendationsList.vue'

const MOCK_RECS = [
  { nom: 'Alice Dupont', initiales: 'AD', type: 'officielle', extrait: 'Excellente travailleuse',  date: '10/06/2026', gradient: '#3D6B5E' },
  { nom: 'Bob Martin',   initiales: 'BM', type: 'rapide',     extrait: 'Très motivé et sérieux',   date: '08/06/2026', gradient: '#f4b94b' },
  { nom: 'Carol Ahmed',  initiales: 'CA', type: 'officielle', extrait: 'Compétences techniques +++', date: '05/06/2026', gradient: '#6ab0de' },
]

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — RecommendationsList
// ═══════════════════════════════════════════════════════

describe('RecommendationsList.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    const wrapper = mount(RecommendationsList, { props: { recs: MOCK_RECS } })
    expect(wrapper.exists()).toBe(true)
  })

  it('2 — affiche le titre "Recommandations émises"', () => {
    const wrapper = mount(RecommendationsList, { props: { recs: MOCK_RECS } })
    expect(wrapper.text()).toContain('Recommandations émises')
  })

  it('3 — affiche autant de .notif-item que de recommandations', () => {
    const wrapper = mount(RecommendationsList, { props: { recs: MOCK_RECS } })
    expect(wrapper.findAll('.notif-item').length).toBe(3)
  })

  it('4 — affiche les noms des candidats', () => {
    const wrapper = mount(RecommendationsList, { props: { recs: MOCK_RECS } })
    expect(wrapper.text()).toContain('Alice Dupont')
    expect(wrapper.text()).toContain('Bob Martin')
    expect(wrapper.text()).toContain('Carol Ahmed')
  })

  it('5 — badge type "officielle" a la classe badge-cert', () => {
    const wrapper = mount(RecommendationsList, { props: { recs: MOCK_RECS } })
    const badges = wrapper.findAll('.rec-type-badge')
    expect(badges[0].text()).toBe('Officielle')
    expect(badges[0].classes()).toContain('badge-cert')
  })

  it('6 — badge type "rapide" a la classe badge-rapide', () => {
    const wrapper = mount(RecommendationsList, { props: { recs: MOCK_RECS } })
    const badges = wrapper.findAll('.rec-type-badge')
    expect(badges[1].text()).toBe('Rapide')
    expect(badges[1].classes()).toContain('badge-rapide')
  })

  it('7 — affiche les extraits de texte', () => {
    const wrapper = mount(RecommendationsList, { props: { recs: MOCK_RECS } })
    expect(wrapper.text()).toContain('Excellente travailleuse')
    expect(wrapper.text()).toContain('Très motivé et sérieux')
  })

  it('8 — affiche les dates', () => {
    const wrapper = mount(RecommendationsList, { props: { recs: MOCK_RECS } })
    expect(wrapper.text()).toContain('10/06/2026')
  })

  it('9 — affiche "Aucune recommandation émise" si recs = []', () => {
    const wrapper = mount(RecommendationsList, { props: { recs: [] } })
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('Aucune recommandation émise')
  })

  it('10 — n\'affiche pas l\'état vide si des recs sont présentes', () => {
    const wrapper = mount(RecommendationsList, { props: { recs: MOCK_RECS } })
    expect(wrapper.find('.empty-state').exists()).toBe(false)
  })

  it('11 — dernier item a la classe no-border', () => {
    const wrapper = mount(RecommendationsList, { props: { recs: MOCK_RECS } })
    const items = wrapper.findAll('.notif-item')
    expect(items[items.length - 1].classes()).toContain('no-border')
  })
})
