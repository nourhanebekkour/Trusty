import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import AdminLayout from '@/components/admin/AdminLayout.vue'

// ── Stubs des sous-composants ─────────────────────────────
const AppTopbar  = { template: '<header class="topbar" :data-notif-count="notifCount"/>', props: ['notifCount'] }
const AppSidebar = { template: '<nav class="sidebar"/>' }

vi.mock('../../src/components/layout/AppTopbar.vue',  () => ({ default: AppTopbar  }))
vi.mock('../../src/components/layout/AppSidebar.vue', () => ({ default: AppSidebar }))

function buildWrapper(routerView = false) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div class="router-view-content">Vue routée</div>' } }],
  })

  return mount(AdminLayout, {
    global: {
      plugins: [router],
      stubs: {
        AppTopbar,
        AppSidebar,
        RouterView: { template: '<div class="router-view-content">Vue routée</div>' },
      },
    },
  })
}

// ─────────────────────────────────────────────────────────
describe('AdminLayout.vue', () => {

  // ══════════════════════════════════════════════════════
  // 1. RENDU DE BASE
  // ══════════════════════════════════════════════════════
  describe('rendu de base', () => {
    it('monte le composant sans erreur', () => {
      const wrapper = buildWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('contient le wrapper racine .admin-layout', () => {
      const wrapper = buildWrapper()
      expect(wrapper.find('.admin-layout').exists()).toBe(true)
    })

    it('affiche AppTopbar', () => {
      const wrapper = buildWrapper()
      expect(wrapper.find('.topbar').exists()).toBe(true)
    })

    it('affiche AppSidebar', () => {
      const wrapper = buildWrapper()
      expect(wrapper.find('.sidebar').exists()).toBe(true)
    })

    it('affiche la zone de contenu principal (.admin-layout__main)', () => {
      const wrapper = buildWrapper()
      expect(wrapper.find('.admin-layout__main').exists()).toBe(true)
    })

    it('affiche la topbar', () => {
      const wrapper = buildWrapper()
      // AdminLayout inclut AppTopbar sans prop data-notif-count direct
      expect(wrapper.find('.topbar').exists()).toBe(true)
    })
  })

  // ══════════════════════════════════════════════════════
  // 2. STRUCTURE CSS
  // ══════════════════════════════════════════════════════
  describe('structure CSS', () => {
    it('.admin-layout__main est bien à l\'intérieur de .admin-layout', () => {
      const wrapper = buildWrapper()
      const layout = wrapper.find('.admin-layout')
      expect(layout.find('.admin-layout__main').exists()).toBe(true)
    })

    it('RouterView est dans .admin-layout__main', () => {
      const wrapper = buildWrapper()
      const main = wrapper.find('.admin-layout__main')
      expect(main.find('.router-view-content').exists()).toBe(true)
    })
  })

  // ══════════════════════════════════════════════════════
  // 3. ORDRE DES ÉLÉMENTS
  // ══════════════════════════════════════════════════════
  describe('ordre des éléments', () => {
    it('Topbar est rendu avant Sidebar', () => {
      const wrapper = buildWrapper()
      const html = wrapper.html()
      expect(html.indexOf('topbar')).toBeLessThan(html.indexOf('sidebar'))
    })

    it('Sidebar est rendu avant le contenu principal', () => {
      const wrapper = buildWrapper()
      const html = wrapper.html()
      expect(html.indexOf('sidebar')).toBeLessThan(html.indexOf('admin-layout__main'))
    })
  })
})