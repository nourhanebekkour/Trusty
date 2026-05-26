import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjectListView from '@/views/Etudiant/ProjectList.vue'

describe('ProjectListView — Tests Unitaires', () => {
  it('1 — se monte sans erreur', () => {
    expect(mount(ProjectListView).exists()).toBe(true)
  })

  it('2 — affiche un contenu visible', () => {
    expect(mount(ProjectListView).text().length).toBeGreaterThan(0)
  })

  it('3 — contient un élément racine div', () => {
    expect(mount(ProjectListView).find('div').exists()).toBe(true)
  })
})
