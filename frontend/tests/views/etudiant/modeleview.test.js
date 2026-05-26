import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ModeleView from '@/views/Etudiant/Modele.vue'

describe('ModeleView — Tests Unitaires', () => {
  it('1 — se monte sans erreur', () => {
    expect(mount(ModeleView).exists()).toBe(true)
  })

  it('2 — affiche un contenu visible', () => {
    expect(mount(ModeleView).text().length).toBeGreaterThan(0)
  })

  it('3 — contient un élément racine div', () => {
    expect(mount(ModeleView).find('div').exists()).toBe(true)
  })
})
