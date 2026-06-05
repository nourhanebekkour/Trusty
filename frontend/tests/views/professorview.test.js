import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfessorView from '@/views/professor/ProfessorView.vue'

// ═════════════════════════════════════════════════════════════
// TESTS UNITAIRES — ProfessorView
// ═════════════════════════════════════════════════════════════

describe('ProfessorView — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    const wrapper = mount(ProfessorView)
    expect(wrapper.exists()).toBe(true)
  })

  it('2 — affiche le titre "Projets à valider"', () => {
    const wrapper = mount(ProfessorView)
    expect(wrapper.text()).toContain('Projets à valider')
  })

  it('3 — affiche le logo Trusty dans la sidebar', () => {
    const wrapper = mount(ProfessorView)
    expect(wrapper.find('.logo').text()).toContain('Trusty')
  })

  it('4 — affiche 4 cartes de statistiques', () => {
    const wrapper = mount(ProfessorView)
    expect(wrapper.findAll('.stat-card').length).toBe(4)
  })

  it('5 — affiche les tabs (Projets, Stages, Activités)', () => {
    const wrapper = mount(ProfessorView)
    expect(wrapper.text()).toContain('Projets')
    expect(wrapper.text()).toContain('Stages')
    expect(wrapper.text()).toContain('Activités')
  })

  it('6 — affiche la liste des projets à valider', () => {
    const wrapper = mount(ProfessorView)
    expect(wrapper.findAll('.proj-item').length).toBeGreaterThan(0)
  })

  it('7 — affiche la section "Mes étudiants"', () => {
    const wrapper = mount(ProfessorView)
    expect(wrapper.text()).toContain('Mes étudiants')
  })

  it('8 — affiche la section "Stages supervisés"', () => {
    const wrapper = mount(ProfessorView)
    expect(wrapper.text()).toContain('Stages supervisés')
  })

  it('9 — affiche la section "Lettres de recommandation"', () => {
    const wrapper = mount(ProfessorView)
    expect(wrapper.text()).toContain('Lettres de recommandation')
  })

  it('10 — affiche des projets en attente avec le bouton "Valider"', () => {
    const wrapper = mount(ProfessorView)
    const validateBtns = wrapper.findAll('.btn-primary.btn-sm').filter(b => b.text() === 'Valider')
    expect(validateBtns.length).toBeGreaterThan(0)
  })
})

// ═════════════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — ProfessorView
// ═════════════════════════════════════════════════════════════

describe("ProfessorView — Tests d'Intégration", () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('11 — clic "Valider" change le statut du projet en "Validé"', async () => {
    const wrapper = mount(ProfessorView)
    const validateBtn = wrapper.findAll('.btn-primary.btn-sm').find(b => b.text() === 'Valider')
    await validateBtn.trigger('click')
    const pills = wrapper.findAll('.pill-valide')
    expect(pills.length).toBeGreaterThan(1)
  })

  it('12 — après validation, le bouton "Valider" disparaît pour ce projet', async () => {
    const wrapper = mount(ProfessorView)
    const initialCount = wrapper.findAll('.btn-primary.btn-sm').filter(b => b.text() === 'Valider').length
    const validateBtn = wrapper.findAll('.btn-primary.btn-sm').find(b => b.text() === 'Valider')
    await validateBtn.trigger('click')
    const newCount = wrapper.findAll('.btn-primary.btn-sm').filter(b => b.text() === 'Valider').length
    expect(newCount).toBe(initialCount - 1)
  })

  it('13 — onglet actif par défaut est "Projets"', () => {
    const wrapper = mount(ProfessorView)
    const activeTab = wrapper.find('.tab.active')
    expect(activeTab.text()).toBe('Projets')
  })

  it('14 — clic sur un onglet différent le rend actif', async () => {
    const wrapper = mount(ProfessorView)
    const tabs = wrapper.findAll('.tab')
    await tabs[1].trigger('click')
    expect(tabs[1].classes()).toContain('active')
  })

  it('15 — affiche les 4 étudiants dans la liste', () => {
    const wrapper = mount(ProfessorView)
    expect(wrapper.findAll('.student-row').length).toBe(4)
  })
})
