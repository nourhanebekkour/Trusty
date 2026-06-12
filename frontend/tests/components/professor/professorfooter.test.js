import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfessorFooter from '@/components/professor/ProfessorFooter.vue'

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — ProfessorFooter
// ═══════════════════════════════════════════════════════

describe('ProfessorFooter.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    const wrapper = mount(ProfessorFooter)
    expect(wrapper.exists()).toBe(true)
  })

  it('2 — contient footer.professor-footer', () => {
    const wrapper = mount(ProfessorFooter)
    expect(wrapper.find('footer.professor-footer').exists()).toBe(true)
  })

  it('3 — affiche le branding "TRUSTY"', () => {
    const wrapper = mount(ProfessorFooter)
    expect(wrapper.text()).toContain('TRUSTY')
  })

  it('4 — affiche la description de la plateforme', () => {
    const wrapper = mount(ProfessorFooter)
    expect(wrapper.text()).toContain('portfolios numériques')
  })

  it('5 — affiche la section "Plateforme"', () => {
    const wrapper = mount(ProfessorFooter)
    expect(wrapper.text()).toContain('Plateforme')
  })

  it('6 — affiche "Comment ça marche" sous Plateforme', () => {
    const wrapper = mount(ProfessorFooter)
    expect(wrapper.text()).toContain('Comment ça marche')
  })

  it('7 — affiche la section "Support"', () => {
    const wrapper = mount(ProfessorFooter)
    expect(wrapper.text()).toContain('Support')
  })

  it('8 — affiche "Centre d\'aide" sous Support', () => {
    const wrapper = mount(ProfessorFooter)
    expect(wrapper.text()).toContain("Centre d’aide")
  })

  it('9 — affiche "Contact"', () => {
    const wrapper = mount(ProfessorFooter)
    expect(wrapper.text()).toContain('Contact')
  })

  it('10 — affiche "Mentions légales"', () => {
    const wrapper = mount(ProfessorFooter)
    expect(wrapper.text()).toContain('Mentions légales')
  })

  it('11 — le footer contient 3 colonnes (3 divs enfants)', () => {
    const wrapper = mount(ProfessorFooter)
    expect(wrapper.find('footer').findAll('div').length).toBeGreaterThanOrEqual(3)
  })
})
