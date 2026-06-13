import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfessionalFooter from '@/components/Professional/ProfessionalFooter.vue'

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — ProfessionalFooter
// ═══════════════════════════════════════════════════════

describe('ProfessionalFooter.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    const wrapper = mount(ProfessionalFooter)
    expect(wrapper.exists()).toBe(true)
  })

  it('2 — contient footer.professional-footer', () => {
    const wrapper = mount(ProfessionalFooter)
    expect(wrapper.find('footer.professional-footer').exists()).toBe(true)
  })

  it('3 — affiche "Espace Professionnel"', () => {
    const wrapper = mount(ProfessionalFooter)
    expect(wrapper.text()).toContain('Espace Professionnel')
  })

  it('4 — affiche "Supervision"', () => {
    const wrapper = mount(ProfessionalFooter)
    expect(wrapper.text()).toContain('Supervision')
  })

  it('5 — affiche "pas de validation officielle"', () => {
    const wrapper = mount(ProfessionalFooter)
    expect(wrapper.text()).toContain('pas de validation officielle')
  })

  it('6 — le footer contient exactement 2 spans', () => {
    const wrapper = mount(ProfessionalFooter)
    expect(wrapper.find('footer').findAll('span').length).toBe(2)
  })
})
