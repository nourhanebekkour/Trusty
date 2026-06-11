import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import HomeView from '@/views/HomeView.vue'

// ── Mock IntersectionObserver avec une vraie classe ES6 ──────────────────────
// Vitest interdit mockReturnValue avec `new` — seule une classe fonctionne.

class IntersectionObserverMock {
  constructor(cb) {}
  observe()    {}
  unobserve()  {}
  disconnect() {}
}

beforeEach(() => {
  global.IntersectionObserver = IntersectionObserverMock
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ── Tests d'intégration ──────────────────────────────────────────────────────

describe('HomeView — intégration complète', () => {

  // ── Montage ────────────────────────────────────────────────────────────────

  it('se monte sans erreur avec tous les composants enfants', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.exists()).toBe(true)
  })

  it('monte en shallow sans erreur', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.exists()).toBe(true)
  })

  // ── Présence des sections (HomeView est un composant monolithique) ──────────

  it('intègre le composant Navbar', () => {
    const wrapper = shallowMount(HomeView)
    // HomeView est monolithique — la navbar est une balise <nav> inline
    expect(wrapper.find('nav.navbar').exists()).toBe(true)
  })

  it('intègre le composant Hero', () => {
    const wrapper = shallowMount(HomeView)
    // Section hero inline
    expect(wrapper.find('section.hero').exists()).toBe(true)
  })

  it('intègre le composant Stats', () => {
    const wrapper = shallowMount(HomeView)
    // Section stats inline
    expect(wrapper.find('section.stats').exists()).toBe(true)
  })

  it('intègre le composant Features', () => {
    const wrapper = shallowMount(HomeView)
    // Section features inline
    expect(wrapper.find('section.features').exists()).toBe(true)
  })

  it('intègre le composant CTA', () => {
    const wrapper = shallowMount(HomeView)
    // Section CTA inline
    expect(wrapper.find('section.cta-banner').exists()).toBe(true)
  })

  it('intègre le composant Footer', () => {
    const wrapper = shallowMount(HomeView)
    // Footer inline
    expect(wrapper.find('footer.footer').exists()).toBe(true)
  })

  // ── Ordre des sections ─────────────────────────────────────────────────────

  it('respecte l\'ordre Navbar > Hero > Stats > Features > CTA > Footer', () => {
    const wrapper = shallowMount(HomeView)
    const selectors = ['nav.navbar', 'section.hero', 'section.stats', 'section.features', 'section.cta-banner', 'footer.footer']
    const elements = selectors.map(s => wrapper.find(s).element)

    elements.forEach(el => expect(el).toBeTruthy())

    for (let i = 0; i < elements.length - 1; i++) {
      const position = elements[i].compareDocumentPosition(elements[i + 1])
      // DOCUMENT_POSITION_FOLLOWING = 4 : le nœud suivant est après dans le DOM
      expect(position & 4).toBeTruthy()
    }
  })

  // ── Structure du DOM ───────────────────────────────────────────────────────

  it('enveloppe les sections dans une div.home', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.find('div.home').exists()).toBe(true)
  })

  it('la Navbar est dans div.home', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.find('div.home nav.navbar').exists()).toBe(true)
  })

  it('le Footer est dans div.home', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.find('div.home footer.footer').exists()).toBe(true)
  })

  it('Hero, Stats, Features et CTA sont dans div.home', () => {
    const wrapper = shallowMount(HomeView)
    const home = wrapper.find('div.home')
    expect(home.find('section.hero').exists()).toBe(true)
    expect(home.find('section.stats').exists()).toBe(true)
    expect(home.find('section.features').exists()).toBe(true)
    expect(home.find('section.cta-banner').exists()).toBe(true)
  })

  // ── Rendu complet (mount) ──────────────────────────────────────────────────

  it('affiche le brand TRUSTY dans le rendu complet', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.text()).toContain('TRUSTY')
  })

  it('affiche le titre Hero dans le rendu complet', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.text()).toContain('Portfolios')
  })

  it('affiche les statistiques dans le rendu complet', () => {
    const wrapper = mount(HomeView)
    // Les labels stats sont en majuscules dans le composant
    expect(wrapper.text()).toContain('ÉTUDIANTS ACTIFS')
  })

  it('affiche les fonctionnalités dans le rendu complet', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.text()).toContain('Validation Institutionnelle')
  })

  it('affiche le CTA dans le rendu complet', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.text()).toContain('Prêt à transformer votre')
  })

  it('affiche le copyright dans le rendu complet', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.text()).toContain('© 2026 Trusty')
  })

  it('possède le bon nom de composant', () => {
    expect(HomeView.name).toBe('HomePage')
  })
})
