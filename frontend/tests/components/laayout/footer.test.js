import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Footer from '@/components/laayout/Footer.vue'

// Mock des assets SVG
vi.mock('@/assets/icons/trusty.svg',  { default: 'trusty.svg' })
vi.mock('@/assets/icons/reseaux.svg', { default: 'reseaux.svg' })
vi.mock('@/assets/icons/apps.svg',    { default: 'apps.svg' })

describe('Footer.vue', () => {

  // ── Structure générale ──────────────────────────────────────────────────────

  it('affiche le composant footer', () => {
    const wrapper = mount(Footer)
    expect(wrapper.find('.footer').exists()).toBe(true)
  })

  it('affiche le logo TRUSTY', () => {
    const wrapper = mount(Footer)
    expect(wrapper.find('.footer__logo-text').text()).toBe('TRUSTY')
  })

  it('affiche le logo image avec alt correct', () => {
    const wrapper = mount(Footer)
    const img = wrapper.find('.footer__logo-icon')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe('Trusty')
  })

  it('affiche la tagline de la plateforme', () => {
    const wrapper = mount(Footer)
    expect(wrapper.find('.footer__tagline').text()).toContain('Portfolios Numériques')
  })

  // ── Colonnes de liens ────────────────────────────────────────────────────────

  it('affiche 3 colonnes de liens', () => {
    const wrapper = mount(Footer)
    expect(wrapper.findAll('.footer__col').length).toBe(3)
  })

  it('affiche la colonne "Plateforme" avec ses liens', () => {
    const wrapper = mount(Footer)
    const cols = wrapper.findAll('.footer__col')
    const plateforme = cols[0]
    expect(plateforme.find('.footer__col-title').text()).toBe('Plateforme')
    const links = plateforme.findAll('.footer__links a')
    expect(links.length).toBe(3)
    expect(links[0].text()).toBe('Comment ça marche')
    expect(links[1].text()).toContain('Certification')
    expect(links[2].text()).toBe('Tarifs')
  })

  it('affiche la colonne "Support" avec ses liens', () => {
    const wrapper = mount(Footer)
    const cols = wrapper.findAll('.footer__col')
    const support = cols[1]
    expect(support.find('.footer__col-title').text()).toBe('Support')
    const links = support.findAll('.footer__links a')
    expect(links.length).toBe(3)
    expect(links[0].text()).toBe("Centre d'aide")
    expect(links[1].text()).toBe('Contact')
    expect(links[2].text()).toBe('Mentions Légales')
  })

  it('affiche la colonne "Suivez-nous"', () => {
    const wrapper = mount(Footer)
    const cols = wrapper.findAll('.footer__col')
    const social = cols[2]
    expect(social.find('.footer__col-title').text()).toBe('Suivez-nous')
  })

  // ── Boutons sociaux ──────────────────────────────────────────────────────────

  it('affiche 2 boutons sociaux', () => {
    const wrapper = mount(Footer)
    expect(wrapper.findAll('.footer__social-btn').length).toBe(2)
  })

  it('les boutons sociaux ont un aria-label accessible', () => {
    const wrapper = mount(Footer)
    const btns = wrapper.findAll('.footer__social-btn')
    expect(btns[0].attributes('aria-label')).toBe('Réseaux sociaux')
    expect(btns[1].attributes('aria-label')).toBe('Applications')
  })

  it('les boutons sociaux contiennent une image', () => {
    const wrapper = mount(Footer)
    const btns = wrapper.findAll('.footer__social-btn')
    btns.forEach(btn => {
      expect(btn.find('img.footer__social-icon').exists()).toBe(true)
    })
  })

  // ── Barre de bas de page ─────────────────────────────────────────────────────

  it('affiche la barre de copyright', () => {
    const wrapper = mount(Footer)
    expect(wrapper.find('.footer__bottom').exists()).toBe(true)
  })

  it('affiche le texte copyright avec l\'année 2026', () => {
    const wrapper = mount(Footer)
    expect(wrapper.find('.footer__bottom p').text()).toContain('2026')
    expect(wrapper.find('.footer__bottom p').text()).toContain('TRUSTY')
  })

  // ── Liens href ───────────────────────────────────────────────────────────────

  it('tous les liens de navigation ont un attribut href', () => {
    const wrapper = mount(Footer)
    const links = wrapper.findAll('.footer__links a')
    links.forEach(link => {
      expect(link.attributes('href')).toBeDefined()
    })
  })
})