import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FavoriteCandidates from '@/components/Professional/FavoriteCandidates.vue'

const MOCK_CANDIDATS = [
  { id: 1, nom: 'Alice Dupont',  initiales: 'AD', formation: 'GINF',  score: 85, gradient: 'linear-gradient(135deg, #66c99f, #3D6B5E)' },
  { id: 2, nom: 'Bob Martin',    initiales: 'BM', formation: 'GIND',  score: 72, gradient: 'linear-gradient(135deg, #f4b94b, #e67e22)' },
  { id: 3, nom: 'Carol Amrani',  initiales: 'CA', formation: 'GINF',  score: 91, gradient: 'linear-gradient(135deg, #6ab0de, #3578a8)' },
]

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — FavoriteCandidates
// ═══════════════════════════════════════════════════════

describe('FavoriteCandidates.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    const wrapper = mount(FavoriteCandidates, { props: { candidats: MOCK_CANDIDATS } })
    expect(wrapper.exists()).toBe(true)
  })

  it('2 — affiche le titre "Candidats suivis"', () => {
    const wrapper = mount(FavoriteCandidates, { props: { candidats: MOCK_CANDIDATS } })
    expect(wrapper.text()).toContain('Candidats suivis')
  })

  it('3 — affiche autant de lignes .student-row que de candidats', () => {
    const wrapper = mount(FavoriteCandidates, { props: { candidats: MOCK_CANDIDATS } })
    expect(wrapper.findAll('.student-row').length).toBe(3)
  })

  it('4 — affiche les noms de tous les candidats', () => {
    const wrapper = mount(FavoriteCandidates, { props: { candidats: MOCK_CANDIDATS } })
    expect(wrapper.text()).toContain('Alice Dupont')
    expect(wrapper.text()).toContain('Bob Martin')
    expect(wrapper.text()).toContain('Carol Amrani')
  })

  it('5 — affiche les formations', () => {
    const wrapper = mount(FavoriteCandidates, { props: { candidats: MOCK_CANDIDATS } })
    expect(wrapper.text()).toContain('GINF')
    expect(wrapper.text()).toContain('GIND')
  })

  it('6 — score >= 80 a la classe CSS "ok"', () => {
    const wrapper = mount(FavoriteCandidates, { props: { candidats: MOCK_CANDIDATS } })
    const scores = wrapper.findAll('.stud-score')
    expect(scores[0].classes()).toContain('ok')
  })

  it('7 — score < 80 a la classe CSS "warn"', () => {
    const wrapper = mount(FavoriteCandidates, { props: { candidats: MOCK_CANDIDATS } })
    const scores = wrapper.findAll('.stud-score')
    expect(scores[1].classes()).toContain('warn')
  })

  it('8 — affiche les scores numériques', () => {
    const wrapper = mount(FavoriteCandidates, { props: { candidats: MOCK_CANDIDATS } })
    expect(wrapper.text()).toContain('85')
    expect(wrapper.text()).toContain('72')
  })

  it('9 — affiche "Aucun favori pour le moment" si liste vide', () => {
    const wrapper = mount(FavoriteCandidates, { props: { candidats: [] } })
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('Aucun favori pour le moment')
  })

  it('10 — n\'affiche pas l\'état vide si des candidats sont présents', () => {
    const wrapper = mount(FavoriteCandidates, { props: { candidats: MOCK_CANDIDATS } })
    expect(wrapper.find('.empty-state').exists()).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — FavoriteCandidates
// ═══════════════════════════════════════════════════════

describe('FavoriteCandidates.vue — Tests d\'Intégration', () => {

  it('11 — clic sur la 1ère ligne émet "select" avec le bon candidat', async () => {
    const wrapper = mount(FavoriteCandidates, { props: { candidats: MOCK_CANDIDATS } })
    await wrapper.findAll('.student-row')[0].trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')[0][0]).toEqual(MOCK_CANDIDATS[0])
  })

  it('12 — clic sur la 2ème ligne émet "select" avec le 2ème candidat', async () => {
    const wrapper = mount(FavoriteCandidates, { props: { candidats: MOCK_CANDIDATS } })
    await wrapper.findAll('.student-row')[1].trigger('click')
    expect(wrapper.emitted('select')[0][0]).toEqual(MOCK_CANDIDATS[1])
  })

  it('13 — plusieurs clics génèrent plusieurs événements "select"', async () => {
    const wrapper = mount(FavoriteCandidates, { props: { candidats: MOCK_CANDIDATS } })
    await wrapper.findAll('.student-row')[0].trigger('click')
    await wrapper.findAll('.student-row')[1].trigger('click')
    expect(wrapper.emitted('select').length).toBe(2)
  })
})
