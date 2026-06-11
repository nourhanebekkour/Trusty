import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CTA from '@/components/HomePage/CTA-HP.vue'

describe('CTA-HP.vue', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(CTA)
    expect(wrapper.exists()).toBe(true)
  })

  it('affiche le titre principal du CTA', () => {
    const wrapper = mount(CTA)
    expect(wrapper.find('h2').text()).toContain('Prêt à transformer votre')
  })

  it('affiche la phrase d\'accroche complète', () => {
    const wrapper = mount(CTA)
    expect(wrapper.text()).toContain('parcours numérique')
  })

  it('affiche le texte de description', () => {
    const wrapper = mount(CTA)
    expect(wrapper.text()).toContain('Rejoignez des milliers')
  })

  it('affiche le bouton principal "Mon Portfolio"', () => {
    const wrapper = mount(CTA)
    const btn = wrapper.find('.btn-cta-white')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toBe('Mon Portfolio')
  })

  it('affiche le bouton secondaire "En savoir plus"', () => {
    const wrapper = mount(CTA)
    const btn = wrapper.find('.btn-cta-ghost')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toBe('En savoir plus')
  })

  it('contient le visuel SVG du shield', () => {
    const wrapper = mount(CTA)
    const visual = wrapper.find('.cta-visual')
    expect(visual.exists()).toBe(true)
    expect(visual.find('svg').exists()).toBe(true)
  })

  it('le container principal cta-banner est présent', () => {
    const wrapper = mount(CTA)
    expect(wrapper.find('.cta-banner').exists()).toBe(true)
  })

  it('les deux boutons sont dans le conteneur cta-actions', () => {
    const wrapper = mount(CTA)
    const actions = wrapper.find('.cta-actions')
    expect(actions.exists()).toBe(true)
    expect(actions.find('.btn-cta-white').exists()).toBe(true)
    expect(actions.find('.btn-cta-ghost').exists()).toBe(true)
  })

  it('le bouton "Mon Portfolio" est cliquable', async () => {
    const wrapper = mount(CTA)
    const btn = wrapper.find('.btn-cta-white')
    await btn.trigger('click')
    // Pas d'erreur = OK (aucun handler défini, comportement normal)
    expect(btn.exists()).toBe(true)
  })

  it('le bouton "En savoir plus" est cliquable', async () => {
    const wrapper = mount(CTA)
    const btn = wrapper.find('.btn-cta-ghost')
    await btn.trigger('click')
    expect(btn.exists()).toBe(true)
  })

  it('possède le bon nom de composant', () => {
    expect(CTA.name).toBe('CTAVue')
  })
})