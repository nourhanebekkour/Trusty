import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import AdminLayout from '@/components/admin/AdminLayout.vue'

// ── Stubs des sous-composants ─────────────────────────────
// AdminLayout.vue uses NavBar and AdminSideBar (not AppTopbar/AppSidebar)
// Stubs définis inline dans les factories vi.mock (pas de variables top-level)
vi.mock('@/components/laayout/NavBar.vue',      () => ({ default: { template: '<header class="topbar"/>' } }))
vi.mock('@/components/admin/AdminSideBar.vue',  () => ({ default: { template: '<nav class="sidebar"/>' } }))
vi.mock('@/components/laayout/Footer.vue',      () => ({ default: { template: '<footer/>' } }))

const NavBar       = { template: '<header class="topbar"/>' }
const AdminSideBar = { template: '<nav class="sidebar"/>' }
const Footer       = { template: '<footer/>' }

function buildWrapper() {
  setActivePinia(createPinia())
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div class="router-view-content">Vue routée</div>' } }],
  })

  return mount(AdminLayout, {
    global: {
      plugins: [router],
      stubs: {
        NavBar,
        AdminSideBar,
        Footer,
        RouterView: { template: '<div class="router-view-content">Vue routée</div>' },
      },
    },
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
})

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

    it('contient le wrapper racine .app', () => {
      const wrapper = buildWrapper()
      expect(wrapper.find('.app').exists()).toBe(true)
    })

    it('affiche NavBar (topbar)', () => {
      const wrapper = buildWrapper()
      expect(wrapper.find('.topbar').exists()).toBe(true)
    })

    it('affiche AdminSideBar (sidebar)', () => {
      const wrapper = buildWrapper()
      expect(wrapper.find('.sidebar').exists()).toBe(true)
    })

    it('affiche la zone de contenu principal (.content)', () => {
      const wrapper = buildWrapper()
      expect(wrapper.find('.content').exists()).toBe(true)
    })

    it('affiche la topbar', () => {
      const wrapper = buildWrapper()
      expect(wrapper.find('.topbar').exists()).toBe(true)
    })
  })

  // ══════════════════════════════════════════════════════
  // 2. STRUCTURE CSS
  // ══════════════════════════════════════════════════════
  describe('structure CSS', () => {
    it('.content est bien à l\'intérieur de .app', () => {
      const wrapper = buildWrapper()
      const app = wrapper.find('.app')
      expect(app.find('.content').exists()).toBe(true)
    })

    it('RouterView est dans .content', () => {
      const wrapper = buildWrapper()
      const main = wrapper.find('.content')
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
      expect(html.indexOf('sidebar')).toBeLessThan(html.indexOf('content'))
    })
  })
})