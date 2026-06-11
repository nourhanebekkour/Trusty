import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfessorLetters from '@/components/professor/ProfessorLetters.vue'

const MOCK_LETTRES = [
  { id: 1, etudiant: 'Alice Dupont', message: 'demande une lettre de recommandation', time: '01/06/2026', formation: 'Master IA',    color: '#3D6B5E', urgent: false, action: 'Rédiger' },
  { id: 2, etudiant: 'Bob Martin',   message: 'relance sa demande en urgence',        time: '02/06/2026', formation: 'Licence Info', color: '#e8a04a', urgent: true,  action: 'Urgent'  },
  { id: 3, etudiant: 'Carol Ahmed',  message: 'attend une réponse',                   time: '03/06/2026', formation: 'GINF',        color: '#6ab0de', urgent: false, action: 'Valider' },
]

beforeEach(() => vi.clearAllMocks())

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — ProfessorLetters
// ═══════════════════════════════════════════════════════

describe('ProfessorLetters.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    const wrapper = mount(ProfessorLetters, { props: { lettres: MOCK_LETTRES } })
    expect(wrapper.exists()).toBe(true)
  })

  it('2 — affiche le titre "Lettres de recommandation"', () => {
    const wrapper = mount(ProfessorLetters, { props: { lettres: MOCK_LETTRES } })
    expect(wrapper.text()).toContain('Lettres de recommandation')
  })

  it('3 — affiche autant de .notif-item que de lettres', () => {
    const wrapper = mount(ProfessorLetters, { props: { lettres: MOCK_LETTRES } })
    expect(wrapper.findAll('.notif-item').length).toBe(3)
  })

  it('4 — affiche les noms des étudiants', () => {
    const wrapper = mount(ProfessorLetters, { props: { lettres: MOCK_LETTRES } })
    expect(wrapper.text()).toContain('Alice Dupont')
    expect(wrapper.text()).toContain('Bob Martin')
    expect(wrapper.text()).toContain('Carol Ahmed')
  })

  it('5 — affiche les messages associés', () => {
    const wrapper = mount(ProfessorLetters, { props: { lettres: MOCK_LETTRES } })
    expect(wrapper.text()).toContain('demande une lettre de recommandation')
    expect(wrapper.text()).toContain('relance sa demande en urgence')
  })

  it('6 — affiche les formations', () => {
    const wrapper = mount(ProfessorLetters, { props: { lettres: MOCK_LETTRES } })
    expect(wrapper.text()).toContain('Master IA')
    expect(wrapper.text()).toContain('Licence Info')
  })

  it('7 — bouton urgent a la classe btn-warn', () => {
    const wrapper = mount(ProfessorLetters, { props: { lettres: MOCK_LETTRES } })
    const buttons = wrapper.findAll('button')
    expect(buttons[1].classes()).toContain('btn-warn')
  })

  it('8 — bouton non-urgent a la classe btn-primary', () => {
    const wrapper = mount(ProfessorLetters, { props: { lettres: MOCK_LETTRES } })
    const buttons = wrapper.findAll('button')
    expect(buttons[0].classes()).toContain('btn-primary')
  })

  it('9 — affiche le texte des actions (Rédiger, Urgent, Valider)', () => {
    const wrapper = mount(ProfessorLetters, { props: { lettres: MOCK_LETTRES } })
    expect(wrapper.text()).toContain('Rédiger')
    expect(wrapper.text()).toContain('Urgent')
    expect(wrapper.text()).toContain('Valider')
  })

  it('10 — affiche 0 item si lettres = []', () => {
    const wrapper = mount(ProfessorLetters, { props: { lettres: [] } })
    expect(wrapper.findAll('.notif-item').length).toBe(0)
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — ProfessorLetters
// ═══════════════════════════════════════════════════════

describe('ProfessorLetters.vue — Tests d\'Intégration', () => {

  it('11 — clic sur le 1er bouton émet "action" avec la 1ère lettre', async () => {
    const wrapper = mount(ProfessorLetters, { props: { lettres: MOCK_LETTRES } })
    await wrapper.findAll('button')[0].trigger('click')
    expect(wrapper.emitted('action')).toBeTruthy()
    expect(wrapper.emitted('action')[0][0]).toEqual(MOCK_LETTRES[0])
  })

  it('12 — clic sur le bouton urgent émet "action" avec la lettre urgente', async () => {
    const wrapper = mount(ProfessorLetters, { props: { lettres: MOCK_LETTRES } })
    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.emitted('action')[0][0]).toEqual(MOCK_LETTRES[1])
  })

  it('13 — plusieurs clics génèrent plusieurs événements "action"', async () => {
    const wrapper = mount(ProfessorLetters, { props: { lettres: MOCK_LETTRES } })
    await wrapper.findAll('button')[0].trigger('click')
    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.emitted('action').length).toBe(2)
  })
})
