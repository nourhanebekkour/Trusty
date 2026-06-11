import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PortfolioView from '@/views/Etudiant/Portfolio.vue'

describe('PortfolioView — Tests Unitaires', () => {
  it('1 — se monte sans erreur', () => {
    expect(mount(PortfolioView).exists()).toBe(true)
  })

  it('2 — affiche un contenu visible', () => {
    expect(mount(PortfolioView).text().length).toBeGreaterThan(0)
  })

  it('3 — contient un élément racine div', () => {
    expect(mount(PortfolioView).find('div').exists()).toBe(true)
  })
})
