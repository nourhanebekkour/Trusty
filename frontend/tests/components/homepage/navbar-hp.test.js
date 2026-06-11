import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Navbar from '@/components/HomePage/Navbar-HP.vue'

describe('Navbar-HP.vue', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(Navbar)
    expect(wrapper.exists()).toBe(true)
  })

  it('affiche le nom de la marque TRUSTY', () => {
    const wrapper = mount(Navbar)
    expect(wrapper.text()).toContain('TRUSTY')
  })

  it('contient un lien de navigation principal', () => {
    const wrapper = mount(Navbar)
    const logo = wrapper.find('a.nav-logo')
    expect(logo.exists()).toBe(true)
  })

  it('le logo possède un attribut href valide', () => {
    const wrapper = mount(Navbar)
    const logo = wrapper.find('a.nav-logo')
    expect(logo.attributes('href')).toBe('#')
  })

  it('affiche l\'icône SVG du shield', () => {
    const wrapper = mount(Navbar)
    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
  })

  it('contient l\'élément logo-icon', () => {
    const wrapper = mount(Navbar)
    const logoIcon = wrapper.find('.logo-icon')
    expect(logoIcon.exists()).toBe(true)
  })

  it('la balise nav est présente', () => {
    const wrapper = mount(Navbar)
    expect(wrapper.find('nav').exists()).toBe(true)
  })

  it('possède le bon nom de composant', () => {
    expect(Navbar.name).toBe('NavbarVue')
  })
})