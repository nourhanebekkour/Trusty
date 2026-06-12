import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SideBar from '@/components/laayout/SideBar.vue'

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

const mockPush   = vi.fn()
const mockLogout = vi.fn()

vi.mock('@/stores/authstore', () => ({
  useAuthStore: () => ({ logout: mockLogout }),
}))

vi.mock('vue-router', () => ({
  useRouter:  () => ({ push: mockPush }),
  RouterLink: { template: '<a><slot /></a>' },
}))

function mountSidebar() {
  return mount(SideBar, {
    global: {
      stubs: { RouterLink: { template: '<a><slot /></a>' } },
    },
  })
}

describe('SideBar.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockLogout.mockResolvedValue(undefined)
  })

  // ── Rendu initial ─────────────────────────────────────────

  it('affiche la sidebar', () => {
    expect(mountSidebar().find('.sidebar').exists()).toBe(true)
  })

  it("n'est pas collapsed par défaut", () => {
    expect(mountSidebar().find('.sidebar').classes()).not.toContain('collapsed')
  })

  it('affiche le bouton toggle', () => {
    expect(mountSidebar().find('.toggle-btn').exists()).toBe(true)
  })

  // ── Liens de navigation ───────────────────────────────────

  const navLabels = [
    'Dashboard', 'Mon Profil', 'Parcours', 'Stages', 'Projets',
    'Recommandations', 'Lettres de reco.', 'Notifications', 'Activités parascolaires', 'Portfolio Complet',
  ]

  navLabels.forEach(label => {
    it(`affiche le lien "${label}"`, () => {
      expect(mountSidebar().find('.sidebar-nav').text()).toContain(label)
    })
  })

  it('affiche 10 liens dans la nav principale', () => {
    expect(mountSidebar().findAll('.sidebar-nav .nav-item').length).toBe(10)
  })

  // ── Section bas ───────────────────────────────────────────

  it('affiche le lien Paramètres en bas', () => {
    expect(mountSidebar().find('.sidebar-bottom').text()).toContain('Paramètres')
  })

  it('affiche le bouton Déconnexion en bas', () => {
    const wrapper = mountSidebar()
    expect(wrapper.find('.logout-btn').exists()).toBe(true)
    expect(wrapper.find('.logout-btn').text()).toContain('Déconnexion')
  })

  // ── Toggle collapse ───────────────────────────────────────

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
    wrapper.findAll('.nav-label').forEach(label => {
      expect(label.isVisible()).toBe(false)
    })
  })

  it('affiche les labels nav quand non collapsed', () => {
    const wrapper = mountSidebar()
    wrapper.findAll('.nav-label').forEach(label => {
      expect(label.isVisible()).toBe(true)
    })
  })

  // ── Logout ────────────────────────────────────────────────

  it('appelle authStore.logout au clic sur Déconnexion', async () => {
    const wrapper = mountSidebar()
    await wrapper.find('.logout-btn').trigger('click')
    await flushPromises()
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  it('redirige vers /login après déconnexion', async () => {
    const wrapper = mountSidebar()
    await wrapper.find('.logout-btn').trigger('click')
    await flushPromises()
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  // ── Icônes ────────────────────────────────────────────────

  it('chaque nav-item contient une icône', () => {
    const wrapper = mountSidebar()
    wrapper.findAll('.sidebar-nav .nav-item').forEach(item => {
      expect(item.find('.nav-icon').exists()).toBe(true)
    })
  })
})
