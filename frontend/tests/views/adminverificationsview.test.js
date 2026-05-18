import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AdminVerifications from '@/views/admin/AdminVerifications.vue'

// ── Stubs ─────────────────────────────────────────────────
const StatCard = { template: '<div class="stat-card">{{ label }}</div>', props: ['label','value','trend','trendColor'] }
vi.mock('../../../src/components/ui/StatCard.vue', () => ({ default: StatCard }))
vi.mock('../../../src/services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}))

function buildWrapper() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: AdminVerifications }] })

  return mount(AdminVerifications, {
    global: { plugins: [pinia, router], stubs: { StatCard } },
  })
}

// ─────────────────────────────────────────────────────────
describe('AdminVerifications.vue', () => {

  beforeEach(() => vi.clearAllMocks())

  // ══════════════════════════════════════════════════════
  // 1. RENDU DE BASE
  // ══════════════════════════════════════════════════════
  describe('rendu de base', () => {
    it('affiche le titre "Vérifications"', () => {
      const wrapper = buildWrapper()
      expect(wrapper.text()).toContain('Vérifications')
    })

    it('affiche les 3 StatCards', () => {
      const wrapper = buildWrapper()
      expect(wrapper.findAll('.stat-card')).toHaveLength(3)
    })

    it('affiche les onglets de filtre', () => {
      const wrapper = buildWrapper()
      expect(wrapper.text()).toContain('Tout')
      expect(wrapper.text()).toContain('Priorité')
      expect(wrapper.text()).toContain('Urgent')
    })

    it('affiche "Tout" comme onglet actif par défaut', () => {
      const wrapper = buildWrapper()
      const activeTab = wrapper.find('.tab--active')
      expect(activeTab.text()).toBe('Tout')
    })
  })

  // ══════════════════════════════════════════════════════
  // 2. LISTE DES PORTFOLIOS
  // ══════════════════════════════════════════════════════
  describe('liste des portfolios', () => {
    it('affiche tous les 4 portfolios mock par défaut', async () => {
      const wrapper = buildWrapper()
      await flushPromises()
      const cards = wrapper.findAll('.portfolio-card')
      expect(cards).toHaveLength(4)
    })

    it('affiche les titres des portfolios', async () => {
      const wrapper = buildWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Portfolio Master Architecture Cloud')
      expect(wrapper.text()).toContain('Showcase Design UI/UX - Mobile First')
    })

    it('affiche les auteurs des portfolios', async () => {
      const wrapper = buildWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Lucas Bernard')
      expect(wrapper.text()).toContain('Emma Lefebvre')
    })

    it('affiche les descriptions', async () => {
      const wrapper = buildWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('infrastructure scalables')
    })

    it('affiche le statut "En attente" sur chaque carte', async () => {
      const wrapper = buildWrapper()
      await flushPromises()
      const pills = wrapper.findAll('.status-pill')
      expect(pills.length).toBeGreaterThan(0)
      pills.forEach(p => expect(p.text()).toBe('En attente'))
    })
  })

  // ══════════════════════════════════════════════════════
  // 3. ONGLETS DE FILTRE
  // ══════════════════════════════════════════════════════
  describe('onglets de filtre', () => {
    it('filtre sur "Priorité" n\'affiche que les prioritaires', async () => {
      const wrapper = buildWrapper()
      await flushPromises()

      const tabs = wrapper.findAll('.tab')
      const prioriteTab = tabs.find(t => t.text() === 'Priorité')
      await prioriteTab.trigger('click')
      await flushPromises()

      const cards = wrapper.findAll('.portfolio-card')
      expect(cards).toHaveLength(1)
      expect(wrapper.text()).toContain('Emma Lefebvre') // priority: 'Priorité'
    })

    it('filtre sur "Urgent" n\'affiche que les urgents', async () => {
      const wrapper = buildWrapper()
      await flushPromises()

      const tabs = wrapper.findAll('.tab')
      const urgentTab = tabs.find(t => t.text() === 'Urgent')
      await urgentTab.trigger('click')
      await flushPromises()

      const cards = wrapper.findAll('.portfolio-card')
      expect(cards).toHaveLength(1)
      expect(wrapper.text()).toContain('Julie Dubois') // priority: 'Urgent'
    })

    it('retour sur "Tout" affiche tous les portfolios', async () => {
      const wrapper = buildWrapper()
      await flushPromises()

      // Passer sur Urgent puis revenir sur Tout
      const tabs = wrapper.findAll('.tab')
      await tabs.find(t => t.text() === 'Urgent').trigger('click')
      await tabs.find(t => t.text() === 'Tout').trigger('click')
      await flushPromises()

      expect(wrapper.findAll('.portfolio-card')).toHaveLength(4)
    })

    it('met à jour l\'onglet actif au clic', async () => {
      const wrapper = buildWrapper()
      const tabs = wrapper.findAll('.tab')
      await tabs.find(t => t.text() === 'Priorité').trigger('click')
      await flushPromises()

      const activeTab = wrapper.find('.tab--active')
      expect(activeTab.text()).toBe('Priorité')
    })
  })

  // ══════════════════════════════════════════════════════
  // 4. CERTIFICATION
  // ══════════════════════════════════════════════════════
  describe('certification d\'un portfolio', () => {
    it('retire le portfolio de la liste après certification', async () => {
      const wrapper = buildWrapper()
      await flushPromises()

      expect(wrapper.findAll('.portfolio-card')).toHaveLength(4)

      const certifyBtn = wrapper.find('button.btn--primary.btn--sm')
      await certifyBtn.trigger('click')
      await flushPromises()

      expect(wrapper.findAll('.portfolio-card')).toHaveLength(3)
    })

    it('affiche le compteur correct après certification', async () => {
      const wrapper = buildWrapper()
      await flushPromises()

      expect(wrapper.text()).toContain('4 sur 4')

      const certifyBtn = wrapper.find('button.btn--primary.btn--sm')
      await certifyBtn.trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain('3 sur 3')
    })
  })

  // ══════════════════════════════════════════════════════
  // 5. NOTES INTERNES
  // ══════════════════════════════════════════════════════
  describe('notes internes', () => {
    it('affiche un textarea de notes par portfolio', async () => {
      const wrapper = buildWrapper()
      await flushPromises()
      const textareas = wrapper.findAll('textarea')
      expect(textareas).toHaveLength(4)
    })

    it('met à jour la note interne d\'un portfolio', async () => {
      const wrapper = buildWrapper()
      await flushPromises()

      const textarea = wrapper.find('textarea')
      await textarea.setValue('Vérifier les liens GitHub')
      expect(textarea.element.value).toBe('Vérifier les liens GitHub')
    })
  })

  // ══════════════════════════════════════════════════════
  // 6. SECTION INFORMATIONS BAS DE PAGE
  // ══════════════════════════════════════════════════════
  describe('informations bas de page', () => {
    it('affiche les critères de certification', () => {
      const wrapper = buildWrapper()
      expect(wrapper.text()).toContain('Critères de Certification')
      expect(wrapper.text()).toContain('Minimum de 3 projets')
    })

    it('affiche l\'impact du sceau admin', () => {
      const wrapper = buildWrapper()
      expect(wrapper.text()).toContain('Impact du Sceau Admin')
    })
  })

  // ══════════════════════════════════════════════════════
  // 7. INITIALES DE L'AVATAR
  // ══════════════════════════════════════════════════════
  describe('initiales avatar', () => {
    it('affiche les initiales correctes pour chaque auteur', async () => {
      const wrapper = buildWrapper()
      await flushPromises()
      // Lucas Bernard → LB, Emma Lefebvre → EL, etc.
      const avatars = wrapper.findAll('.avatar-sm')
      expect(avatars[0].text()).toBe('LB')
      expect(avatars[1].text()).toBe('EL')
    })
  })
})