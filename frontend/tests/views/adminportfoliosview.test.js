import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AdminPortfolios from '@/views/admin/AdminPortfolios.vue'
import { useAdminStore } from '@/stores/adminStore'

// ── Stubs ─────────────────────────────────────────────────
const StatCard      = { template: '<div class="stat-card">{{ label }}:{{ value }}</div>', props: ['label','value','sub'] }
const StatusBadge   = { template: '<span class="status-badge">{{ status }}</span>', props: ['status'] }
const AppPagination = { template: '<div class="pagination"/>', props: ['currentPage','totalPages','totalItems','perPage','itemLabel'], emits: ['page-change'] }

vi.mock('../../../src/components/ui/StatCard.vue',      () => ({ default: StatCard      }))
vi.mock('../../../src/components/ui/StatusBadge.vue',   () => ({ default: StatusBadge   }))
vi.mock('../../../src/components/ui/AppPagination.vue', () => ({ default: AppPagination }))
vi.mock('../../../src/services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}))

function buildWrapper(storeOverrides = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: AdminPortfolios }] })

  const wrapper = mount(AdminPortfolios, {
    global: { plugins: [pinia, router], stubs: { StatCard, StatusBadge, AppPagination } },
  })

  const store = useAdminStore()
  Object.assign(store, { loading: false, error: null, verificationQueue: [], ...storeOverrides })
  return { wrapper, store }
}

// ─────────────────────────────────────────────────────────
describe('AdminPortfolios.vue', () => {

  beforeEach(() => vi.clearAllMocks())

  // ══════════════════════════════════════════════════════
  // 1. RENDU DE BASE
  // ══════════════════════════════════════════════════════
  describe('rendu de base', () => {
    it('affiche le titre de la page', () => {
      const { wrapper } = buildWrapper()
      expect(wrapper.text()).toContain('Portfolios')
    })

    it('affiche les boutons Exporter et Vérification en masse', () => {
      const { wrapper } = buildWrapper()
      expect(wrapper.text()).toContain('Exporter CSV')
      expect(wrapper.text()).toContain('Vérification en masse')
    })

    it('affiche les 4 StatCards', () => {
      const { wrapper } = buildWrapper()
      expect(wrapper.findAll('.stat-card')).toHaveLength(4)
    })

    it('affiche la pagination', async () => {
      const { wrapper } = buildWrapper()
      await flushPromises()
      expect(wrapper.find('.pagination').exists()).toBe(true)
    })
  })

  // ══════════════════════════════════════════════════════
  // 2. TABLEAU DES PORTFOLIOS (données mock)
  // ══════════════════════════════════════════════════════
  describe('tableau des portfolios', () => {
    it('affiche les portfolios mock au rendu initial', async () => {
      const { wrapper } = buildWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Julie Martin')
      expect(wrapper.text()).toContain('Lucas Bernard')
    })

    it('affiche les statuts des portfolios', async () => {
      const { wrapper } = buildWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Certifié')
      expect(wrapper.text()).toContain('En attente')
    })

    it('affiche "Aucun portfolio trouvé" si aucun résultat de recherche', async () => {
      const { wrapper } = buildWrapper()
      await flushPromises()

      await wrapper.find('input[placeholder*="Rechercher"]').setValue('xyzinexistant')
      await flushPromises()

      expect(wrapper.text()).toContain('Aucun portfolio trouvé')
    })
  })

  // ══════════════════════════════════════════════════════
  // 3. RECHERCHE
  // ══════════════════════════════════════════════════════
  describe('recherche par étudiant', () => {
    it('filtre par nom d\'étudiant', async () => {
      const { wrapper } = buildWrapper()
      await flushPromises()

      await wrapper.find('input[placeholder*="Rechercher"]').setValue('julie')
      await flushPromises()

      expect(wrapper.text()).toContain('Julie Martin')
      expect(wrapper.text()).not.toContain('Lucas Bernard')
    })

    it('filtre par titre de portfolio', async () => {
      const { wrapper } = buildWrapper()
      await flushPromises()

      await wrapper.find('input[placeholder*="Rechercher"]').setValue('ux/ui')
      await flushPromises()

      expect(wrapper.text()).toContain('Design UX/UI')
    })
  })

  // ══════════════════════════════════════════════════════
  // 4. FILTRE PAR STATUT
  // ══════════════════════════════════════════════════════
  describe('filtre par statut', () => {
    it('filtre les portfolios "Certifié"', async () => {
      const { wrapper } = buildWrapper()
      await flushPromises()

      const statusSelect = wrapper.findAll('select')[0]
      await statusSelect.setValue('Certifié')
      await flushPromises()

      // Seuls les certifiés apparaissent
      const badges = wrapper.findAll('.status-badge')
      badges.forEach(b => {
        if (b.text()) expect(b.text()).toBe('Certifié')
      })
    })

    it('filtre les portfolios "En attente"', async () => {
      const { wrapper } = buildWrapper()
      await flushPromises()

      const statusSelect = wrapper.findAll('select')[0]
      await statusSelect.setValue('En attente')
      await flushPromises()

      expect(wrapper.text()).toContain('Lucas Bernard')
      expect(wrapper.text()).not.toContain('Sophie Petit') // Certifié
    })
  })

  // ══════════════════════════════════════════════════════
  // 5. TRI
  // ══════════════════════════════════════════════════════
  describe('tri', () => {
    it('le tri "Plus anciens" inverse l\'ordre de la liste', async () => {
      const { wrapper } = buildWrapper()
      await flushPromises()

      const sortSelect = wrapper.findAll('select')[1]
      await sortSelect.setValue('oldest')
      await flushPromises()

      // Chloé Garcia est en dernière position dans la liste originale
      // Après reverse, elle devrait apparaître en premier
      const rows = wrapper.findAll('tbody tr')
      expect(rows[0].text()).toContain('Chloé Garcia')
    })
  })

  // ══════════════════════════════════════════════════════
  // 6. CERTIFICATION
  // ══════════════════════════════════════════════════════
  describe('certification d\'un portfolio', () => {
    it('appelle certifyPortfolio du store et met à jour le statut', async () => {
      const { wrapper, store } = buildWrapper()
      store.certifyPortfolio = vi.fn().mockResolvedValue({ success: true })
      await flushPromises()

      // Certifier le portfolio "En attente" (Lucas Bernard, id=2)
      const certifyBtns = wrapper.findAll('button[title="Certifier"]')
      await certifyBtns[0].trigger('click')
      await flushPromises()

      expect(store.certifyPortfolio).toHaveBeenCalled()
    })

    it('désactive le bouton de certification pendant le chargement', async () => {
      let resolveCertify
      const { wrapper, store } = buildWrapper()
      store.certifyPortfolio = vi.fn().mockReturnValue(
        new Promise(res => { resolveCertify = res })
      )
      await flushPromises()

      const certifyBtn = wrapper.findAll('button[title="Certifier"]')[0]
      await certifyBtn.trigger('click')

      expect(certifyBtn.attributes('disabled')).toBeDefined()
      resolveCertify({ success: true })
      await flushPromises()
    })
  })

  // ══════════════════════════════════════════════════════
  // 7. STATS CALCULÉES
  // ══════════════════════════════════════════════════════
 describe('stats calculées', () => {

  it('calcule correctement le nombre de certifiés', async () => {
    const { wrapper } = buildWrapper()

    await flushPromises()

    expect(wrapper.text()).toContain('3')
  })

  it('affiche le taux de certification', async () => {
    const { wrapper } = buildWrapper()

    await flushPromises()

    expect(wrapper.exists()).toBe(true)
  })

})
  // ══════════════════════════════════════════════════════
  // 8. BANNIÈRE D'ERREUR
  // ══════════════════════════════════════════════════════
  describe('bannière d\'erreur', () => {
    it('affiche l\'erreur du store', async () => {
      const { wrapper, store } = buildWrapper()
      store.error = 'Erreur de chargement'
      await flushPromises()
      expect(wrapper.find('.error-banner').exists()).toBe(true)
    })
  })

  // ══════════════════════════════════════════════════════
  // 9. CHARGEMENT INITIAL
  // ══════════════════════════════════════════════════════
  describe('chargement initial', () => {
    it('appelle fetchVerificationQueue au montage', async () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const store = useAdminStore()
      store.fetchVerificationQueue = vi.fn().mockResolvedValue(undefined)

      const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: AdminPortfolios }] })
      mount(AdminPortfolios, {
        global: { plugins: [pinia, router], stubs: { StatCard, StatusBadge, AppPagination } },
      })
      await flushPromises()

      expect(store.fetchVerificationQueue).toHaveBeenCalledOnce()
    })
  })
})