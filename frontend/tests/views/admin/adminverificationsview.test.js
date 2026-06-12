import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { reactive } from 'vue'
import AdminVerifications from '@/views/admin/AdminVerifications.vue'

// ── Stubs ─────────────────────────────────────────────────
const { StatCard } = vi.hoisted(() => ({
  StatCard: { template: '<div class="stat-card">{{ label }}</div>', props: ['label','value','trend','trendColor'] },
}))
vi.mock('../../../src/components/ui/StatCard.vue', () => ({ default: StatCard }))
vi.mock('@/stores/adminStore', () => ({ useAdminStore: vi.fn() }))
vi.mock('@/stores/authstore',  () => ({ useAuthStore:  vi.fn() }))
vi.mock('../../../src/services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}))

import { useAdminStore } from '@/stores/adminStore'
import { useAuthStore }  from '@/stores/authstore'

function makeMockStore(overrides = {}) {
  return reactive({
    loading:         false,
    error:           null,
    verificationQueue: [],
    validatingId:    null,
    fetchVerificationQueue: vi.fn().mockResolvedValue(undefined),
    validateEntity:  vi.fn().mockResolvedValue({ success: true }),
    ...overrides,
  })
}

function buildWrapper(storeOverrides = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const store = makeMockStore(storeOverrides)
  useAdminStore.mockReturnValue(store)

  const authStore = { user: { role: 'ADMINISTRATEUR' }, isAdmin: () => true }
  useAuthStore.mockReturnValue(authStore)

  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: AdminVerifications }] })

  return {
    wrapper: mount(AdminVerifications, {
      global: { plugins: [pinia, router], stubs: { StatCard } },
    }),
    store,
  }
}

// ─────────────────────────────────────────────────────────
describe('AdminVerifications.vue', () => {

  beforeEach(() => vi.clearAllMocks())

  // ══════════════════════════════════════════════════════
  // 1. RENDU DE BASE
  // ══════════════════════════════════════════════════════
  describe('rendu de base', () => {
    it('affiche le titre "Vérifications"', () => {
      const { wrapper } = buildWrapper()
      expect(wrapper.text()).toContain('Vérifications')
    })

    it('affiche le sous-titre descriptif', () => {
      const { wrapper } = buildWrapper()
      expect(wrapper.text()).toContain('en attente de validation')
    })

    it('affiche les 3 StatCards', () => {
      const { wrapper } = buildWrapper()
      expect(wrapper.findAll('.stat-card')).toHaveLength(3)
    })

    it('affiche le bouton Rafraîchir', () => {
      const { wrapper } = buildWrapper()
      expect(wrapper.text()).toContain('Rafraîchir')
    })
  })

  // ══════════════════════════════════════════════════════
  // 2. LISTE VIDE
  // ══════════════════════════════════════════════════════
  describe('file vide', () => {
    it('affiche "Aucun élément en attente" si la file est vide', async () => {
      const { wrapper } = buildWrapper({ verificationQueue: [] })
      await flushPromises()
      expect(wrapper.text()).toContain('Aucun élément en attente de vérification')
    })
  })

  // ══════════════════════════════════════════════════════
  // 3. ITEMS EN FILE
  // ══════════════════════════════════════════════════════
  describe('items en file', () => {
    it('affiche les items de la file', async () => {
      const { wrapper } = buildWrapper({
        verificationQueue: [
          { id: 'a1', type: 'ACTIVITE',     title: 'Projet IA', author: 'Alice Dupont',  description: 'desc1' },
          { id: 'p1', type: 'PROFESSIONNEL', title: 'Profil TechCorp', author: 'Bob Martin', description: 'desc2' },
        ],
      })
      await flushPromises()
      expect(wrapper.text()).toContain('Projet IA')
      expect(wrapper.text()).toContain('Profil TechCorp')
    })

    it('affiche le badge "Activité" pour les items de type ACTIVITE', async () => {
      const { wrapper } = buildWrapper({
        verificationQueue: [
          { id: 'a1', type: 'ACTIVITE', title: 'Activité test', author: 'Alice', description: '' },
        ],
      })
      await flushPromises()
      expect(wrapper.text()).toContain('Activité')
    })

    it('affiche le badge "Professionnel" pour les items de type PROFESSIONNEL', async () => {
      const { wrapper } = buildWrapper({
        verificationQueue: [
          { id: 'p1', type: 'PROFESSIONNEL', title: 'Profil pro', author: 'Bob', description: '' },
        ],
      })
      await flushPromises()
      expect(wrapper.text()).toContain('Professionnel')
    })

    it('affiche les boutons Approuver et Rejeter', async () => {
      const { wrapper } = buildWrapper({
        verificationQueue: [
          { id: 'a1', type: 'ACTIVITE', title: 'Test', author: 'Alice', description: '' },
        ],
      })
      await flushPromises()
      expect(wrapper.text()).toContain('Approuver')
      expect(wrapper.text()).toContain('Rejeter')
    })
  })

  // ══════════════════════════════════════════════════════
  // 4. ACTIONS
  // ══════════════════════════════════════════════════════
  describe('actions', () => {
    it('clic Approuver appelle validateEntity avec APPROUVE', async () => {
      const { wrapper, store } = buildWrapper({
        verificationQueue: [
          { id: 'a1', type: 'ACTIVITE', title: 'Test', author: 'Alice', description: '' },
        ],
      })
      await flushPromises()

      const approuverBtn = wrapper.find('button.btn--primary.btn--sm')
      await approuverBtn.trigger('click')
      await flushPromises()

      expect(store.validateEntity).toHaveBeenCalledWith('ACTIVITE', 'a1', 'APPROUVE')
    })

    it('clic Rejeter appelle validateEntity avec REJETE', async () => {
      const { wrapper, store } = buildWrapper({
        verificationQueue: [
          { id: 'a1', type: 'ACTIVITE', title: 'Test', author: 'Alice', description: '' },
        ],
      })
      await flushPromises()

      const rejeterBtn = wrapper.find('button.btn--ghost.btn--sm')
      await rejeterBtn.trigger('click')
      await flushPromises()

      expect(store.validateEntity).toHaveBeenCalledWith('ACTIVITE', 'a1', 'REJETE')
    })

    it('clic Rafraîchir appelle fetchVerificationQueue', async () => {
      const { wrapper, store } = buildWrapper()
      await wrapper.find('button.btn--secondary').trigger('click')
      await flushPromises()
      expect(store.fetchVerificationQueue).toHaveBeenCalled()
    })
  })

  // ══════════════════════════════════════════════════════
  // 5. BANNIÈRE D'ERREUR
  // ══════════════════════════════════════════════════════
  describe('bannière d\'erreur', () => {
    it('affiche la bannière si store.error est défini', async () => {
      const { wrapper } = buildWrapper({ error: 'Erreur de chargement' })
      await flushPromises()
      expect(wrapper.find('.error-banner').exists()).toBe(true)
    })

    it('n\'affiche pas la bannière si store.error est null', async () => {
      const { wrapper } = buildWrapper({ error: null })
      await flushPromises()
      expect(wrapper.find('.error-banner').exists()).toBe(false)
    })
  })

  // ══════════════════════════════════════════════════════
  // 6. CHARGEMENT INITIAL
  // ══════════════════════════════════════════════════════
  describe('chargement initial', () => {
    it('appelle fetchVerificationQueue au montage', async () => {
      const { store } = buildWrapper()
      await flushPromises()
      expect(store.fetchVerificationQueue).toHaveBeenCalledOnce()
    })
  })
})
