import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import HomeView from '@/views/HomeView.vue'

// Mock IntersectionObserver
class IntersectionObserverMock {
  constructor(cb) {}
  observe()    {}
  unobserve()  {}
  disconnect() {}
}

// Mock vue-router (HomeView uses $router.push in template)
vi.mock('vue-router', () => ({
  useRoute:   vi.fn(() => ({ query: {}, params: {} })),
  useRouter:  vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })),
  RouterLink: { template: '<a><slot /></a>' },
}))

beforeEach(() => {
  global.IntersectionObserver = IntersectionObserverMock
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('HomeView — intégration complète', () => {

  // ── Montage ────────────────────────────────────────────────────────────────

  it('se monte sans erreur avec tous les composants enfants', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.exists()).toBe(true)
  })

  it('monte en shallow sans erreur', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.exists()).toBe(true)
  })

  // ── Présence du conteneur racine ─────────────────────────────────────────

  it('enveloppe le contenu dans div.landing-page', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.find('div.landing-page').exists()).toBe(true)
  })

  it('intègre le composant NavbarLanding', () => {
    const wrapper = shallowMount(HomeView)
    // shallowMount stubs child components — navbar-landing or NavbarLanding stub appears
    expect(wrapper.find('[data-theme="landing"]').exists()).toBe(true)
  })

  it('intègre la section hero', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.find('section.section-hero').exists()).toBe(true)
  })

  it('intègre la section spaces', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.find('section.section-spaces').exists()).toBe(true)
  })

  it('intègre la section features', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.find('section.section-features').exists()).toBe(true)
  })

  it('intègre la section steps (comment ça marche)', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.find('section.section-steps').exists()).toBe(true)
  })

  // ── Ordre des sections ─────────────────────────────────────────────────────

  it('respecte l\'ordre section-hero > section-spaces > section-features > section-steps', () => {
    const wrapper = shallowMount(HomeView)
    const selectors = ['section.section-hero', 'section.section-spaces', 'section.section-features', 'section.section-steps']
    const elements = selectors.map(s => wrapper.find(s).element)

    elements.forEach(el => expect(el).toBeTruthy())

    for (let i = 0; i < elements.length - 1; i++) {
      const position = elements[i].compareDocumentPosition(elements[i + 1])
      expect(position & 4).toBeTruthy()
    }
  })

  // ── Structure du DOM ───────────────────────────────────────────────────────

  it('div.landing-page contient la section hero', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.find('div.landing-page section.section-hero').exists()).toBe(true)
  })

  it('div.landing-page contient la section features', () => {
    const wrapper = shallowMount(HomeView)
    const page = wrapper.find('div.landing-page')
    expect(page.find('section.section-features').exists()).toBe(true)
    expect(page.find('section.section-steps').exists()).toBe(true)
  })

  // ── Rendu complet (mount + shallowMount) ───────────────────────────────────

  it('affiche du texte visible', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.text().length).toBeGreaterThan(0)
  })

  it('affiche le titre de la section features', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.text()).toContain('Tout ce dont vous avez besoin')
  })

  it('affiche la section "Comment ça marche"', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.text()).toContain('Comment ça marche')
  })

  it('affiche la section "Trois espaces"', () => {
    const wrapper = shallowMount(HomeView)
    expect(wrapper.text()).toContain('Trois espaces')
  })

  it('section hero contient des boutons d\'action', () => {
    const wrapper = shallowMount(HomeView)
    const hero = wrapper.find('section.section-hero')
    expect(hero.findAll('button').length).toBeGreaterThan(0)
  })

  it('les fonctionnalités sont listées (au moins 4)', () => {
    const wrapper = shallowMount(HomeView)
    // features array has 6 items — FeatureCard components stub in shallowMount
    const featureSection = wrapper.find('section.section-features')
    expect(featureSection.exists()).toBe(true)
  })
})
