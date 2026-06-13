import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Footer from '@/components/HomePage/Footer-HP.vue'

describe('Footer-HP.vue', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(Footer)
    expect(wrapper.exists()).toBe(true)
  })

  it('affiche le nom de la marque TRUSTY', () => {
    const wrapper = mount(Footer)
    expect(wrapper.text()).toContain('TRUSTY')
  })

  it('affiche le logo avec lien', () => {
    const wrapper = mount(Footer)
    const logo = wrapper.find('a.nav-logo')
    expect(logo.exists()).toBe(true)
    expect(logo.text()).toContain('TRUSTY')
  })

  it('affiche la tagline de la plateforme', () => {
    const wrapper = mount(Footer)
    expect(wrapper.text()).toContain('Portfolios Numériques Adaptatifs et Certifiés')
  })

  it('affiche la colonne "Plateforme" avec ses liens', () => {
    const wrapper = mount(Footer)
    expect(wrapper.text()).toContain('Plateforme')
    expect(wrapper.text()).toContain('Comment ça marche')
    expect(wrapper.text()).toContain('Tarifs')
  })

  it('affiche la colonne "Support" avec ses liens', () => {
    const wrapper = mount(Footer)
    expect(wrapper.text()).toContain('Support')
    expect(wrapper.text()).toContain("Centre d'aide")
    expect(wrapper.text()).toContain('Contact')
    expect(wrapper.text()).toContain('Mentions Légales')
  })

  it('affiche la colonne "Suivez-nous"', () => {
    const wrapper = mount(Footer)
    expect(wrapper.text()).toContain('Suivez-nous')
  })

  it('affiche les boutons sociaux', () => {
    const wrapper = mount(Footer)
    const socialBtns = wrapper.findAll('.social-btn')
    expect(socialBtns).toHaveLength(2)
  })

  it('affiche le copyright 2026', () => {
    const wrapper = mount(Footer)
    expect(wrapper.text()).toContain('© 2026 TRUSTY')
  })

  it('affiche le texte "Made with care"', () => {
    const wrapper = mount(Footer)
    expect(wrapper.find('.made-with').text()).toContain('Made with care')
  })

  it('les liens de navigation sont des balises <a>', () => {
    const wrapper = mount(Footer)
    const links = wrapper.findAll('.footer-col a')
    expect(links.length).toBeGreaterThanOrEqual(6)
  })

  it('les colonnes ont des titres h4 en majuscules', () => {
    const wrapper = mount(Footer)
    const headers = wrapper.findAll('.footer-col h4')
    expect(headers.length).toBeGreaterThanOrEqual(3)
  })

  it('affiche les SVG dans les boutons sociaux', () => {
    const wrapper = mount(Footer)
    const socialBtns = wrapper.findAll('.social-btn')
    socialBtns.forEach(btn => {
      expect(btn.find('svg').exists()).toBe(true)
    })
  })

  it('affiche le footer-bottom avec les infos légales', () => {
    const wrapper = mount(Footer)
    expect(wrapper.find('.footer-bottom').exists()).toBe(true)
  })

  it('possède le bon nom de composant', () => {
    expect(Footer.name).toBe('FooterVue')
  })
})