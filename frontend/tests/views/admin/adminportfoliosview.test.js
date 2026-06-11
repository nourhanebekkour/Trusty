import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { reactive } from 'vue'
import AdminPortfolios from '@/views/admin/AdminPortfolios.vue'

// ── Stubs ─────────────────────────────────────────────────
const { StatCard, AppPagination } = vi.hoisted(() => ({
  StatCard:      { template: '<div class="stat-card">{{ label }}:{{ value }}</div>', props: ['label','value','sub'] },
  AppPagination: { template: '<div class="pagination"/>', props: ['currentPage','totalPages','totalItems','perPage','itemLabel'], emits: ['page-change'] },
}))

vi.mock('../../../src/components/ui/StatCard.vue',      () => ({ default: StatCard      }))
vi.mock('../../../src/components/ui/AppPagination.vue', () => ({ default: AppPagination }))
vi.mock('@/stores/adminStore', () => ({ useAdminStore: vi.fn() }))
vi.mock('@/stores/authstore',  () => ({ useAuthStore:  vi.fn() }))
vi.mock('../../../src/services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}))

import { useAdminStore } from '@/stores/adminStore'
import { useAuthStore }  from '@/stores/authstore'

// ── Dataset étudiants (structure plate = adminStore.students) ──────────────────
const mockStudents = [
  { id_etudiant: 1, prenom: 'Alice',   nom: 'Dupont',  email: 'alice@e.fr',   status_compte: 'ACTIF',   date_creation: '2024-01-01' },
  { id_etudiant: 2, prenom: 'Bob',     nom: 'Martin',  email: 'bob@e.fr',     status_compte: 'ACTIF',   date_creation: '2024-02-01' },
  { id_etudiant: 3, prenom: 'Claire',  nom: 'Bernard', email: 'claire@e.fr',  status_compte: 'INACTIF', date_creation: '2024-03-01' },
  { id_etudiant: 4, prenom: 'David',   nom: 'Petit',   email: 'david@e.fr',   status_compte: 'ACTIF',   date_creation: '2024-04-01' },
]

function makeMockStore(overrides = {}) {
  return reactive({
    loading:           false,
    error:             null,
    students:          [...mockStudents],
    verificationQueue: [],
    fetchStudents:     vi.fn().mockResolvedValue(undefined),
    fetchVerificationQueue: vi.fn().mockResolvedValue(undefined),
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

  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: AdminPortfolios }] })

  return {
    wrapper: mount(AdminPortfolios, {
      global: { plugins: [pinia, router], stubs: { StatCard, AppPagination } },
    }),
    store,
  }
}

// ─────────────────────────────────────────────────────────
describe('AdminPortfolios.vue (Étudiants & Portfolios)', () => {

  beforeEach(() => vi.clearAllMocks())

  // ══════════════════════════════════════════════════════
  // 1. RENDU DE BASE
  // ══════════════════════════════════════════════════════
  describe('rendu de base', () => {
    it('affiche le titre de la page', () => {
      const { wrapper } = buildWrapper()
      expect(wrapper.text()).toContain('Étudiants')
    })

    it('affiche le bouton Rafraîchir', () => {
      const { wrapper } = buildWrapper()
      expect(wrapper.text()).toContain('Rafraîchir')
    })

    it('affiche les 3 StatCards', () => {
      const { wrapper } = buildWrapper()
      expect(wrapper.findAll('.stat-card')).toHaveLength(3)
    })

    it('affiche la pagination', async () => {
      const { wrapper } = buildWrapper()
      await flushPromises()
      expect(wrapper.find('.pagination').exists()).toBe(true)
    })
  })

  // ══════════════════════════════════════════════════════
  // 2. TABLEAU DES ÉTUDIANTS
  // ══════════════════════════════════════════════════════
  describe('tableau des étudiants', () => {
    it('affiche les étudiants du store', async () => {
      const { wrapper } = buildWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Alice')
      expect(wrapper.text()).toContain('Bob')
    })

    it('affiche "Aucun étudiant trouvé" si aucun résultat de recherche', async () => {
      const { wrapper } = buildWrapper()
      await flushPromises()

      const input = wrapper.find('input[placeholder*="Rechercher"]')
      await input.setValue('xyzinexistant')
      await flushPromises()

      expect(wrapper.text()).toContain('Aucun étudiant trouvé')
    })

    it('avec liste vide, affiche "Aucun étudiant trouvé"', async () => {
      const { wrapper } = buildWrapper({ students: [] })
      await flushPromises()
      expect(wrapper.text()).toContain('Aucun étudiant trouvé')
    })
  })

  // ══════════════════════════════════════════════════════
  // 3. RECHERCHE
  // ══════════════════════════════════════════════════════
  describe('recherche par étudiant', () => {
    it('filtre par prénom/nom', async () => {
      const { wrapper } = buildWrapper()
      await flushPromises()

      await wrapper.find('input[placeholder*="Rechercher"]').setValue('alice')
      await flushPromises()

      expect(wrapper.text()).toContain('Alice')
      expect(wrapper.text()).not.toContain('Bob')
    })

    it('filtre par email', async () => {
      const { wrapper } = buildWrapper()
      await flushPromises()

      await wrapper.find('input[placeholder*="Rechercher"]').setValue('bob@e.fr')
      await flushPromises()

      expect(wrapper.text()).toContain('Bob')
      expect(wrapper.text()).not.toContain('Alice')
    })
  })

  // ══════════════════════════════════════════════════════
  // 4. STATS CALCULÉES
  // ══════════════════════════════════════════════════════
  describe('stats calculées', () => {
    it('Total Étudiants reflète le nombre de students', async () => {
      const { wrapper } = buildWrapper({ students: mockStudents })
      await flushPromises()
      expect(wrapper.text()).toContain('4')
    })
  })

  // ══════════════════════════════════════════════════════
  // 5. BANNIÈRE D'ERREUR
  // ══════════════════════════════════════════════════════
  describe('bannière d\'erreur', () => {
    it('affiche l\'erreur du store', async () => {
      const { wrapper } = buildWrapper({ error: 'Erreur de chargement' })
      await flushPromises()
      expect(wrapper.find('.error-banner').exists()).toBe(true)
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
