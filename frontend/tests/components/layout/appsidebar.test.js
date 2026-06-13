import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockLogout = vi.fn()
const mockPush   = vi.fn()

vi.mock('@/stores/authstore', () => ({
  useAuthStore: vi.fn(() => ({ logout: mockLogout })),
}))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRoute:  vi.fn(() => ({ path: '/admin/dashboard' })),
    useRouter: vi.fn(() => ({ push: mockPush })),
  }
})

import { useRoute } from 'vue-router'

// ── Helper ────────────────────────────────────────────────────────────────────

function mountSidebar(currentPath = '/admin/dashboard') {
  useRoute.mockReturnValue({ path: currentPath })
  return mount(AppSidebar, {
    global: {
      stubs: { RouterLink: { template: '<a><slot /></a>' } },
    },
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AppSidebar.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Rendu des liens ───────────────────────────────────────────────────────

  describe('Navigation items', () => {
    it('affiche les 7 éléments de navigation', () => {
      const wrapper = mountSidebar()
      // 7 items nav + Paramètres + Déconnexion = 9 sidebar__item total
      const navItems = wrapper.findAll('.sidebar__nav .sidebar__item')
      expect(navItems.length).toBe(7)
    })

    it('affiche "Dashboard" dans les liens', () => {
      const wrapper = mountSidebar()
      expect(wrapper.text()).toContain('Dashboard')
    })

    it('affiche "Utilisateurs" dans les liens', () => {
      const wrapper = mountSidebar()
      expect(wrapper.text()).toContain('Utilisateurs')
    })

    it('affiche "Vérifications" dans les liens', () => {
      const wrapper = mountSidebar()
      expect(wrapper.text()).toContain('Vérifications')
    })

    it('affiche "Portfolios" dans les liens', () => {
      const wrapper = mountSidebar()
      expect(wrapper.text()).toContain('Portfolios')
    })

    it('affiche "Notifications" dans les liens', () => {
      const wrapper = mountSidebar()
      expect(wrapper.text()).toContain('Notifications')
    })
  })

  // ── Lien actif ────────────────────────────────────────────────────────────

  describe('isActive', () => {
    it('applique sidebar__item--active sur le lien courant', () => {
      const wrapper = mountSidebar('/admin/dashboard')
      const activeItems = wrapper.findAll('.sidebar__item--active')
      expect(activeItems.length).toBeGreaterThan(0)
    })

    it('active la route pour un sous-chemin (startsWith)', () => {
      useRoute.mockReturnValue({ path: '/admin/utilisateurs/42' })
      const wrapper = mountSidebar('/admin/utilisateurs/42')
      const activeItems = wrapper.findAll('.sidebar__item--active')
      expect(activeItems.length).toBeGreaterThan(0)
    })

    it("n'active pas les autres routes", () => {
      const wrapper = mountSidebar('/admin/dashboard')
      const allItems = wrapper.findAll('.sidebar__nav .sidebar__item')
      const activeItems = allItems.filter(i => i.classes().includes('sidebar__item--active'))
      // Seul Dashboard doit être actif
      expect(activeItems.length).toBe(1)
    })
  })

  // ── Bas de la barre ───────────────────────────────────────────────────────

  describe('Section bas de page', () => {
    it('affiche le lien Paramètres', () => {
      const wrapper = mountSidebar()
      expect(wrapper.find('.sidebar__bottom').text()).toContain('Paramètres')
    })

    it('affiche le bouton Déconnexion', () => {
      const wrapper = mountSidebar()
      const logoutBtn = wrapper.find('.sidebar__item--danger')
      expect(logoutBtn.exists()).toBe(true)
      expect(logoutBtn.text()).toContain('Déconnexion')
    })
  })

  // ── Déconnexion ───────────────────────────────────────────────────────────

  describe('handleLogout', () => {
    it('appelle auth.logout() en cliquant sur Déconnexion', async () => {
      const wrapper = mountSidebar()
      await wrapper.find('.sidebar__item--danger').trigger('click')
      expect(mockLogout).toHaveBeenCalledTimes(1)
    })

    it('redirige vers la page login après déconnexion', async () => {
      const wrapper = mountSidebar()
      await wrapper.find('.sidebar__item--danger').trigger('click')
      expect(mockPush).toHaveBeenCalledWith({ name: 'login' })
    })
  })
})