import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { RouterLinkStub } from '@vue/test-utils'
import AdminSideBar from '@/components/admin/AdminSideBar.vue'

vi.mock('@/stores/authstore', () => ({
  useAuthStore: vi.fn(),
}))
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

import { useAuthStore } from '@/stores/authstore'
import { useRouter }    from 'vue-router'

let mockLogout
let mockRouterPush

function makeMockStores() {
  mockLogout     = vi.fn().mockResolvedValue(undefined)
  mockRouterPush = vi.fn()
  useAuthStore.mockReturnValue({ user: { prenom: 'Admin', nom: 'Test' }, logout: mockLogout })
  useRouter.mockReturnValue({ push: mockRouterPush })
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  makeMockStores()
})

const mountSidebar = () => mount(AdminSideBar, {
  global: { stubs: { RouterLink: RouterLinkStub } },
})

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — AdminSideBar
// ═══════════════════════════════════════════════════════

describe('AdminSideBar.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    expect(mountSidebar().exists()).toBe(true)
  })

  it('2 — contient aside.sidebar', () => {
    expect(mountSidebar().find('aside.sidebar').exists()).toBe(true)
  })

  it('3 — contient nav.sidebar-nav', () => {
    expect(mountSidebar().find('nav.sidebar-nav').exists()).toBe(true)
  })

  it('4 — contient le bouton toggle .toggle-btn', () => {
    expect(mountSidebar().find('.toggle-btn').exists()).toBe(true)
  })

  it('5 — affiche le lien Dashboard', () => {
    expect(mountSidebar().text()).toContain('Dashboard')
  })

  it('6 — affiche le lien Utilisateurs', () => {
    expect(mountSidebar().text()).toContain('Utilisateurs')
  })

  it('7 — affiche le lien Vérifications', () => {
    expect(mountSidebar().text()).toContain('Vérifications')
  })

  it('8 — affiche le lien Étudiants', () => {
    expect(mountSidebar().text()).toContain('Étudiants')
  })

  it('9 — affiche le lien Notifications', () => {
    expect(mountSidebar().text()).toContain('Notifications')
  })

  it('10 — affiche le lien Badges', () => {
    expect(mountSidebar().text()).toContain('Badges')
  })

  it('11 — affiche le lien Historique', () => {
    expect(mountSidebar().text()).toContain('Historique')
  })

  it('12 — affiche le lien Profil', () => {
    expect(mountSidebar().text()).toContain('Profil')
  })

  it('13 — affiche le lien Paramètres dans .sidebar-bottom', () => {
    expect(mountSidebar().find('.sidebar-bottom').text()).toContain('Paramètres')
  })

  it('14 — affiche le bouton Déconnexion', () => {
    expect(mountSidebar().find('.logout-btn').exists()).toBe(true)
    expect(mountSidebar().text()).toContain('Déconnexion')
  })

  it('15 — la sidebar n\'a pas la classe "collapsed" par défaut', () => {
    expect(mountSidebar().find('aside.sidebar').classes()).not.toContain('collapsed')
  })

  it('16 — le .sidebar-nav contient 8 liens router-link', () => {
    const links = mountSidebar().find('.sidebar-nav').findAllComponents(RouterLinkStub)
    expect(links.length).toBe(8)
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — AdminSideBar
// ═══════════════════════════════════════════════════════

describe('AdminSideBar.vue — Tests d\'Intégration', () => {

  it('17 — clic sur .toggle-btn ajoute la classe "collapsed" à la sidebar', async () => {
    const wrapper = mountSidebar()
    await wrapper.find('.toggle-btn').trigger('click')
    expect(wrapper.find('aside.sidebar').classes()).toContain('collapsed')
  })

  it('18 — double clic sur .toggle-btn retire la classe "collapsed"', async () => {
    const wrapper = mountSidebar()
    await wrapper.find('.toggle-btn').trigger('click')
    await wrapper.find('.toggle-btn').trigger('click')
    expect(wrapper.find('aside.sidebar').classes()).not.toContain('collapsed')
  })

  it('19 — clic sur Déconnexion appelle authStore.logout()', async () => {
    const wrapper = mountSidebar()
    await wrapper.find('.logout-btn').trigger('click')
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })
})
