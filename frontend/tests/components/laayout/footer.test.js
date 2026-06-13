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

  it('affiche la colonne "Plateforme" avec ses items', () => {
    const wrapper = mount(Footer)
    const cols = wrapper.findAll('.footer__col')
    const plateforme = cols[0]
    expect(plateforme.find('.footer__col-title').text()).toBe('Plateforme')
    // Source uses <span> elements, not <a>, for Plateforme items
    const nav = plateforme.find('.footer__links')
    expect(nav.text()).toContain('Comment ça marche')
    expect(nav.text()).toContain('Certification')
    expect(nav.text()).toContain('Tarifs')
  })

  it('affiche la colonne "Support" avec ses items', () => {
    const wrapper = mount(Footer)
    const cols = wrapper.findAll('.footer__col')
    const support = cols[1]
    expect(support.find('.footer__col-title').text()).toBe('Support')
    // Source: only "Contact" is an <a>; others are <span>
    const nav = support.find('.footer__links')
    expect(nav.text()).toContain("Centre d'aide")
    expect(nav.text()).toContain('Contact')
    expect(nav.text()).toContain('Mentions Légales')
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
    // Source: aria-label="Réseaux sociaux non configurés" / "Applications non configurées"
    expect(btns[0].attributes('aria-label')).toContain('Réseaux sociaux')
    expect(btns[1].attributes('aria-label')).toContain('Applications')
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

  it('le lien "Contact" dans Support a un attribut href', () => {
    const wrapper = mount(Footer)
    // Source: only "Contact" is an <a href="mailto:...">
    const links = wrapper.findAll('.footer__links a')
    expect(links.length).toBeGreaterThanOrEqual(1)
    links.forEach(link => {
      expect(link.attributes('href')).toBeDefined()
    })
  })
})