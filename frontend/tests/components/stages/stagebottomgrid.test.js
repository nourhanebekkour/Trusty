import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StageBottomGrid from '@/components/stages/StageBottomGrid.vue'

function mountGrid() {
  return mount(StageBottomGrid)
}

// ═════════════════════════════════════════════════════════════
// TESTS UNITAIRES — StageBottomGrid
// ═════════════════════════════════════════════════════════════

describe('StageBottomGrid.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    const wrapper = mountGrid()
    expect(wrapper.exists()).toBe(true)
  })

  it('2 — affiche la section "Comment faire valider un stage"', () => {
    const wrapper = mountGrid()
    expect(wrapper.text()).toContain('Comment faire valider un stage')
  })

  it('3 — affiche la section "Ressources UTILES"', () => {
    const wrapper = mountGrid()
    expect(wrapper.text()).toContain('Ressources UTILES')
  })

  it('4 — affiche "Guide des Stages"', () => {
    const wrapper = mountGrid()
    expect(wrapper.text()).toContain('Guide des Stages')
  })

  it('5 — affiche "Modèle Rapport"', () => {
    const wrapper = mountGrid()
    expect(wrapper.text()).toContain('Modèle Rapport')
  })

  it('6 — affiche 2 ressources cliquables', () => {
    const wrapper = mountGrid()
    expect(wrapper.findAll('.resource-item').length).toBe(2)
  })

  it('7 — affiche la liste des étapes de validation', () => {
    const wrapper = mountGrid()
    expect(wrapper.find('.info-list').exists()).toBe(true)
    expect(wrapper.findAll('.info-list li').length).toBeGreaterThan(0)
  })

  it('8 — émet "download" avec "guide" au clic sur Guide des Stages', async () => {
    const wrapper = mountGrid()
    const items = wrapper.findAll('.resource-item')
    await items[0].trigger('click')
    expect(wrapper.emitted('download')).toBeTruthy()
    expect(wrapper.emitted('download')[0]).toEqual(['guide'])
  })

  it('9 — émet "download" avec "modele" au clic sur Modèle Rapport', async () => {
    const wrapper = mountGrid()
    const items = wrapper.findAll('.resource-item')
    await items[1].trigger('click')
    expect(wrapper.emitted('download')[0]).toEqual(['modele'])
  })
})
