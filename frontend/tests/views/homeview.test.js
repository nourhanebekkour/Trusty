import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import HomeView from '@/views/HomeView.vue'

import Navbar   from '@/components/HomePage/Navbar-HP.vue'
import Hero     from '@/components/HomePage/Hero-HP.vue'
import Stats    from '@/components/HomePage/Stats-HP.vue'
import Features from '@/components/HomePage/Features-HP.vue'
import CTA      from '@/components/HomePage/CTA-HP.vue'
import Footer   from '@/components/HomePage/Footer-HP.vue'

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

  // ── Présence des composants (par référence d'import — seule méthode fiable) ─

  it('intègre le composant Navbar', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.findComponent(Navbar).exists()).toBe(true)
  })

  it('intègre le composant Hero', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.findComponent(Hero).exists()).toBe(true)
  })

  it('intègre le composant Stats', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.findComponent(Stats).exists()).toBe(true)
  })

  it('intègre le composant Features', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.findComponent(Features).exists()).toBe(true)
  })

  it('intègre le composant CTA', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.findComponent(CTA).exists()).toBe(true)
  })

  it('intègre le composant Footer', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.findComponent(Footer).exists()).toBe(true)
  })

  // ── Ordre des sections ─────────────────────────────────────────────────────
  // compareDocumentPosition est fiable quel que soit le nom du stub généré.

  it('respecte l\'ordre Navbar > Hero > Stats > Features > CTA > Footer', () => {
    const wrapper = shallowMount(HomeView)
    const components = [Navbar, Hero, Stats, Features, CTA, Footer]
    const elements = components.map(c => wrapper.findComponent(c).element)

    elements.forEach(el => expect(el).toBeTruthy())

    for (let i = 0; i < elements.length - 1; i++) {
      const position = elements[i].compareDocumentPosition(elements[i + 1])
      // DOCUMENT_POSITION_FOLLOWING = 4 : le nœud suivant est après dans le DOM
      expect(position & 4).toBeTruthy()
    }
  })

  // ── Structure du DOM ───────────────────────────────────────────────────────

  it('enveloppe les sections dans une balise <main>', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.find('main').exists()).toBe(true)
  })

  it('la Navbar est en dehors du <main>', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.find('main').findComponent(Navbar).exists()).toBe(false)
  })

  it('le Footer est en dehors du <main>', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.find('main').findComponent(Footer).exists()).toBe(false)
  })

  it('Hero, Stats, Features et CTA sont dans le <main>', () => {
    const wrapper = shallowMount(HomeView)
    const main = wrapper.find('main')
    expect(main.findComponent(Hero).exists()).toBe(true)
    expect(main.findComponent(Stats).exists()).toBe(true)
    expect(main.findComponent(Features).exists()).toBe(true)
    expect(main.findComponent(CTA).exists()).toBe(true)
  })

  // ── Rendu complet (mount) ──────────────────────────────────────────────────

  it('affiche le brand TRUSTY dans le rendu complet', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.text()).toContain('TRUSTY')
  })

  it('affiche le titre Hero dans le rendu complet', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.text()).toContain('Portfolios Numériques')
  })

  it('affiche les statistiques dans le rendu complet', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.text()).toContain('Étudiants Actifs')
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
    expect(wrapper.text()).toContain('© 2026 TRUSTY')
  })

  it('possède le bon nom de composant', () => {
    expect(HomeView.name).toBe('HomeView')
  })
})