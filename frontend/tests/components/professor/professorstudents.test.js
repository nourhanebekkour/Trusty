import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfessorStudents from '@/components/professor/ProfessorStudents.vue'

const MOCK_ETUDIANTS = [
  { id: 1, nom: 'Alice Dupont',  formation: 'Master IA',    initiales: 'AD', gradient: 'linear-gradient(135deg,#66c99f,#3D6B5E)', score: 90 },
  { id: 2, nom: 'Bob Martin',    formation: 'Licence Info', initiales: 'BM', gradient: 'linear-gradient(135deg,#f4b94b,#e67e22)', score: 55 },
  { id: 3, nom: 'Carol Amrani',  formation: 'GINF',         initiales: 'CA', gradient: 'linear-gradient(135deg,#6ab0de,#3578a8)', score: 82 },
]

beforeEach(() => vi.clearAllMocks())

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — ProfessorStudents
// ═══════════════════════════════════════════════════════

describe('ProfessorStudents.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    const wrapper = mount(ProfessorStudents, { props: { etudiants: MOCK_ETUDIANTS } })
    expect(wrapper.exists()).toBe(true)
  })

  it('2 — affiche le titre "Mes étudiants"', () => {
    const wrapper = mount(ProfessorStudents, { props: { etudiants: MOCK_ETUDIANTS } })
    expect(wrapper.find('.card-title').text()).toContain('Mes étudiants')
  })

  it('3 — affiche autant de .student-row que d\'étudiants valides', () => {
    const wrapper = mount(ProfessorStudents, { props: { etudiants: MOCK_ETUDIANTS } })
    expect(wrapper.findAll('.student-row').length).toBe(3)
  })

  it('4 — affiche les noms des étudiants', () => {
    const wrapper = mount(ProfessorStudents, { props: { etudiants: MOCK_ETUDIANTS } })
    expect(wrapper.text()).toContain('Alice Dupont')
    expect(wrapper.text()).toContain('Bob Martin')
    expect(wrapper.text()).toContain('Carol Amrani')
  })

  it('5 — affiche les formations', () => {
    const wrapper = mount(ProfessorStudents, { props: { etudiants: MOCK_ETUDIANTS } })
    expect(wrapper.text()).toContain('Master IA')
    expect(wrapper.text()).toContain('Licence Info')
    expect(wrapper.text()).toContain('GINF')
  })

  it('6 — score >= 80 a la classe CSS "ok"', () => {
    const wrapper = mount(ProfessorStudents, { props: { etudiants: MOCK_ETUDIANTS } })
    const scores = wrapper.findAll('.stud-score')
    expect(scores[0].classes()).toContain('ok')
  })

  it('7 — score < 80 a la classe CSS "warn"', () => {
    const wrapper = mount(ProfessorStudents, { props: { etudiants: MOCK_ETUDIANTS } })
    const scores = wrapper.findAll('.stud-score')
    expect(scores[1].classes()).toContain('warn')
  })

  it('8 — affiche les valeurs de score', () => {
    const wrapper = mount(ProfessorStudents, { props: { etudiants: MOCK_ETUDIANTS } })
    expect(wrapper.text()).toContain('90')
    expect(wrapper.text()).toContain('55')
    expect(wrapper.text()).toContain('82')
  })

  it('9 — filtre les étudiants sans id (id = undefined)', () => {
    const invalides = [{ nom: 'Sans id', formation: 'Test', initiales: 'SI', score: 50 }]
    const wrapper = mount(ProfessorStudents, { props: { etudiants: invalides } })
    expect(wrapper.findAll('.student-row').length).toBe(0)
  })

  it('10 — filtre les étudiants null dans le tableau', () => {
    const avecNull = [...MOCK_ETUDIANTS, null]
    const wrapper = mount(ProfessorStudents, { props: { etudiants: avecNull } })
    expect(wrapper.findAll('.student-row').length).toBe(3)
  })

  it('11 — affiche 0 ligne si étudiants = []', () => {
    const wrapper = mount(ProfessorStudents, { props: { etudiants: [] } })
    expect(wrapper.findAll('.student-row').length).toBe(0)
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — ProfessorStudents
// ═══════════════════════════════════════════════════════

describe('ProfessorStudents.vue — Tests d\'Intégration', () => {

  it('12 — clic sur la 1ère ligne émet "select" avec (id, nom)', async () => {
    const wrapper = mount(ProfessorStudents, { props: { etudiants: MOCK_ETUDIANTS } })
    await wrapper.findAll('.student-row')[0].trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')[0]).toEqual([1, 'Alice Dupont'])
  })

  it('13 — clic sur la 2ème ligne émet "select" avec (id, nom) corrects', async () => {
    const wrapper = mount(ProfessorStudents, { props: { etudiants: MOCK_ETUDIANTS } })
    await wrapper.findAll('.student-row')[1].trigger('click')
    expect(wrapper.emitted('select')[0]).toEqual([2, 'Bob Martin'])
  })

  it('14 — plusieurs clics génèrent plusieurs événements "select"', async () => {
    const wrapper = mount(ProfessorStudents, { props: { etudiants: MOCK_ETUDIANTS } })
    await wrapper.findAll('.student-row')[0].trigger('click')
    await wrapper.findAll('.student-row')[2].trigger('click')
    expect(wrapper.emitted('select').length).toBe(2)
    expect(wrapper.emitted('select')[1]).toEqual([3, 'Carol Amrani'])
  })
})
