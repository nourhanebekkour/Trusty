import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RecommendationsView from '@/views/Etudiant/Recommendations.vue'

describe('RecommendationsView — Tests Unitaires', () => {
  it('1 — se monte sans erreur', () => {
    expect(mount(RecommendationsView).exists()).toBe(true)
  })

  it('2 — affiche un contenu visible', () => {
    expect(mount(RecommendationsView).text().length).toBeGreaterThan(0)
  })

  it('3 — contient un élément racine div', () => {
    expect(mount(RecommendationsView).find('div').exists()).toBe(true)
  })
})
