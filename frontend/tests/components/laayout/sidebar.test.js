import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SideBar from '@/components/laayout/SideBar.vue'

// ── Mocks assets ──────────────────────────────────────────────────────────────
vi.mock('@/assets/icons/dashboard.svg',        { default: 'dashboard.svg' })
vi.mock('@/assets/icons/profile.svg',          { default: 'profile.svg' })
vi.mock('@/assets/icons/parcours.svg',         { default: 'parcours.svg' })
vi.mock('@/assets/icons/stages.svg',           { default: 'stages.svg' })
vi.mock('@/assets/icons/projets.svg',          { default: 'projets.svg' })
vi.mock('@/assets/icons/settings.svg',         { default: 'settings.svg' })
vi.mock('@/assets/icons/logout.svg',           { default: 'logout.svg' })
vi.mock('@/assets/icons/recommandations.svg',  { default: 'recommandations.svg' })
vi.mock('@/assets/icons/notifications.svg',    { default: 'notifications.svg' })
vi.mock('@/assets/icons/modeles.svg',          { default: 'modeles.svg' })
vi.mock('@/assets/icons/portfoliocomplet.svg', { default: 'portfoliocomplet.svg' })

function mountSidebar() {
  return mount(SideBar, {
    global: {
      stubs: { RouterLink: { template: '<a><slot /></a>' } },
    },
  })
}

describe('SideBar.vue', () => {

  // ── Rendu initial ─────────────────────────────────────────────────────────

  it('affiche la sidebar', () => {
    const wrapper = mountSidebar()
    expect(wrapper.find('.sidebar').exists()).toBe(true)
  })

  it("n'est pas collapsed par défaut", () => {
    const wrapper = mountSidebar()
    expect(wrapper.find('.sidebar').classes()).not.toContain('collapsed')
  })

  it('affiche le bouton toggle', () => {
    const wrapper = mountSidebar()
    expect(wrapper.find('.toggle-btn').exists()).toBe(true)
  })

  // ── Liens de navigation ───────────────────────────────────────────────────

  const navLabels = [
    'Dashboard',
    'Mon Profil',
    'Parcours',
    'Stages',
    'Projets',
    'Recommandations',
    'Notifications',
    'Modèles',
    'Portfolio Complet',
  ]

  navLabels.forEach(label => {
    it(`affiche le lien "${label}"`, () => {
      const wrapper = mountSidebar()
      expect(wrapper.find('.sidebar-nav').text()).toContain(label)
    })
  })

  it('affiche 9 liens dans la nav principale', () => {
    const wrapper = mountSidebar()
    expect(wrapper.findAll('.sidebar-nav .nav-item').length).toBe(9)
  })

  // ── Section bas ───────────────────────────────────────────────────────────

  it('affiche le lien Paramètres en bas', () => {
    const wrapper = mountSidebar()
    expect(wrapper.find('.sidebar-bottom').text()).toContain('Paramètres')
  })

  it('affiche le bouton Déconnexion en bas', () => {
    const wrapper = mountSidebar()
    expect(wrapper.find('.logout-btn').exists()).toBe(true)
    expect(wrapper.find('.logout-btn').text()).toContain('Déconnexion')
  })

  // ── Toggle collapse ───────────────────────────────────────────────────────

  it('ajoute la classe collapsed après un clic sur le toggle', async () => {
    const wrapper = mountSidebar()
    await wrapper.find('.toggle-btn').trigger('click')
    expect(wrapper.find('.sidebar').classes()).toContain('collapsed')
  })

  it('retire la classe collapsed après deux clics (toggle)', async () => {
    const wrapper = mountSidebar()
    await wrapper.find('.toggle-btn').trigger('click')
    await wrapper.find('.toggle-btn').trigger('click')
    expect(wrapper.find('.sidebar').classes()).not.toContain('collapsed')
  })

  it('cache les labels nav quand collapsed', async () => {
    const wrapper = mountSidebar()
    await wrapper.find('.toggle-btn').trigger('click')
    // v-show met display:none sur les nav-label
    const labels = wrapper.findAll('.nav-label')
    labels.forEach(label => {
      expect(label.isVisible()).toBe(false)
    })
  })

  it('affiche les labels nav quand non collapsed', () => {
    const wrapper = mountSidebar()
    const labels = wrapper.findAll('.nav-label')
    labels.forEach(label => {
      expect(label.isVisible()).toBe(true)
    })
  })

  // ── Émission logout ───────────────────────────────────────────────────────

  it("émet 'logout' en cliquant sur le bouton Déconnexion", async () => {
    const wrapper = mountSidebar()
    await wrapper.find('.logout-btn').trigger('click')
    expect(wrapper.emitted('logout')).toBeTruthy()
  })

  it("émet 'logout' une seule fois par clic", async () => {
    const wrapper = mountSidebar()
    await wrapper.find('.logout-btn').trigger('click')
    expect(wrapper.emitted('logout').length).toBe(1)
  })

  // ── Icônes ────────────────────────────────────────────────────────────────

  it('chaque nav-item contient une icône', () => {
    const wrapper = mountSidebar()
    const items = wrapper.findAll('.sidebar-nav .nav-item')
    items.forEach(item => {
      expect(item.find('.nav-icon').exists()).toBe(true)
    })
  })
})