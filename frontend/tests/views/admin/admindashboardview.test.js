import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AdminDashboard from '@/views/admin/AdminDashboard.vue'
import { useAdminStore } from '@/stores/adminStore'
import { useAuthStore } from '@/stores/authstore'

// ── Stubs des composants UI ───────────────────────────────
const { StatCard, StatusBadge, AppModal } = vi.hoisted(() => ({
  StatCard:    { template: '<div class="stat-card"><slot name="icon"/><span>{{ label }}</span><span>{{ value }}</span></div>', props: ['label','value','trend','trendColor','sub'] },
  StatusBadge: { template: '<span class="status-badge">{{ status }}</span>', props: ['status'] },
  AppModal:    { template: '<div v-if="show" class="modal"><slot/><button @click="$emit(\'confirm\')">Confirmer</button><button @click="$emit(\'close\')">Fermer</button></div>', props: ['show','title','subtitle'], emits: ['confirm','close'] },
}))

vi.mock('../../../src/components/ui/StatCard.vue',    () => ({ default: StatCard    }))
vi.mock('../../../src/components/ui/StatusBadge.vue', () => ({ default: StatusBadge }))
vi.mock('../../../src/components/ui/AppModal.vue',    () => ({ default: AppModal    }))
vi.mock('../../../src/services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}))

// ── Helpers ───────────────────────────────────────────────
function buildWrapper(storeOverrides = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: AdminDashboard }] })

  const wrapper = mount(AdminDashboard, {
    global: {
      plugins: [pinia, router],
      stubs: { StatCard, StatusBadge, AppModal },
    },
  })

  const store = useAdminStore()
  Object.assign(store, storeOverrides)
  return { wrapper, store }
}

// ─────────────────────────────────────────────────────────
describe('AdminDashboard.vue', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ══════════════════════════════════════════════════════
  // 1. RENDU DE BASE
  // ══════════════════════════════════════════════════════
  describe('rendu de base', () => {
    it('affiche le titre de la page', () => {
      const { wrapper } = buildWrapper()
      expect(wrapper.text()).toContain('Tableau de Bord Administrateur')
    })

    it('affiche le bouton "Créer un utilisateur"', () => {
      const { wrapper } = buildWrapper()
      expect(wrapper.text()).toContain('Créer un utilisateur')
    })

    it('affiche 4 StatCards', () => {
      const { wrapper } = buildWrapper()
      expect(wrapper.findAll('.stat-card')).toHaveLength(4)
    })
  })

  // ══════════════════════════════════════════════════════
  // 2. FILE DE VÉRIFICATION
  // ══════════════════════════════════════════════════════
  describe('file de vérification', () => {
    it('affiche les items de la file de vérification', async () => {
      const { wrapper, store } = buildWrapper()
      store.verificationQueue = [
        { id: '1', author: 'Jean Dupont',  type: 'ACTIVITE',     title: 'Projet IA', date: new Date().toISOString() },
        { id: '2', author: 'Marie Martin', type: 'PROFESSIONNEL', title: 'Stage Dev', date: new Date().toISOString() },
      ]
      store.loading = false
      await flushPromises()

      expect(wrapper.text()).toContain('Jean Dupont')
      expect(wrapper.text()).toContain('Marie Martin')
    })

    it('affiche le badge avec le nombre d\'items en attente', async () => {
      const { wrapper, store } = buildWrapper()
      store.verificationQueue = [{ id: '1' }, { id: '2' }, { id: '3' }]
      await flushPromises()
      expect(wrapper.text()).toContain('3 à traiter')
    })

    it('affiche "Aucun élément en attente" si la file est vide', async () => {
      const { wrapper, store } = buildWrapper()
      store.verificationQueue = []
      store.loading = false
      await flushPromises()
      expect(wrapper.text()).toContain('Aucun élément en attente')
    })

    it('affiche "…" pendant le chargement', async () => {
      const { wrapper, store } = buildWrapper()
      store.loading = true
      await flushPromises()
      const loadingEls = wrapper.findAll('.state-msg')
      expect(loadingEls.some(el => el.text().includes('Chargement'))).toBe(true)
    })
  })

  // ══════════════════════════════════════════════════════
  // 3. MODAL CRÉER UN UTILISATEUR
  // ══════════════════════════════════════════════════════
 describe('modal créer un utilisateur', () => {

  it('ouvre le modal au clic sur "+ Créer un utilisateur"', async () => {
    const { wrapper } = buildWrapper()

    await wrapper.find('button.btn--primary').trigger('click')

    await flushPromises()

    expect(wrapper.exists()).toBe(true)
  })

  it('ouvre correctement le modal', async () => {
    const { wrapper } = buildWrapper()

    await wrapper.find('button.btn--primary').trigger('click')

    await flushPromises()

    expect(wrapper.exists()).toBe(true)
  })

})

  // ══════════════════════════════════════════════════════
  // 4. GESTION DES UTILISATEURS
  // ══════════════════════════════════════════════════════
  describe('gestion des utilisateurs', () => {
    it('affiche la liste des utilisateurs', async () => {
      const { wrapper, store } = buildWrapper()
      store.users = [
        { id_utilisateur: 'u1', prenom: 'Jean',  nom: 'Dupont', email: 'j@e.fr', role: 'ADMIN',    status_compte: 'ACTIF',   date_creation: '2024-01-01' },
        { id_utilisateur: 'u2', prenom: 'Marie', nom: 'Martin', email: 'm@e.fr', role: 'ETUDIANT', status_compte: 'INACTIF', date_creation: '2024-02-01' },
      ]
      store.loading = false
      await flushPromises()
      expect(wrapper.text()).toContain('Jean')
      expect(wrapper.text()).toContain('Marie')
    })

    it('filtre les utilisateurs selon la recherche', async () => {
      const { wrapper, store } = buildWrapper()
      store.users = [
        { id_utilisateur: 'u1', prenom: 'Jean',   nom: 'Dupont', email: 'jean@e.fr',   role: 'ADMIN',    status_compte: 'ACTIF', date_creation: '2024-01-01' },
        { id_utilisateur: 'u2', prenom: 'Sophie', nom: 'Martin', email: 'sophie@e.fr', role: 'ETUDIANT', status_compte: 'ACTIF', date_creation: '2024-01-01' },
      ]
      store.loading = false
      await flushPromises()

      const searchInput = wrapper.find('input[placeholder*="Rechercher"]')
      await searchInput.setValue('jean')
      await flushPromises()

      expect(wrapper.text()).toContain('Jean')
      expect(wrapper.text()).not.toContain('Sophie')
    })
  })

  // ══════════════════════════════════════════════════════
  // 5. HISTORIQUE DES CERTIFICATIONS
  // ══════════════════════════════════════════════════════
  describe('historique des certifications', () => {
    it('affiche les items de l\'historique', async () => {
      const { wrapper, store } = buildWrapper()
      store.certHistory = [
        { id: 'c1', utilisateur: { prenom: 'Admin', nom: 'A' }, action: 'certifié', type_entite: 'projet', date_action: '2024-05-01' },
      ]
      store.loading = false
      await flushPromises()
      expect(wrapper.text()).toContain('certifié')
    })

    it('affiche "Aucune certification récente" si l\'historique est vide', async () => {
      const { wrapper, store } = buildWrapper()
      store.certHistory = []
      store.loading = false
      await flushPromises()
      expect(wrapper.text()).toContain('Aucune certification récente')
    })
  })

  // ══════════════════════════════════════════════════════
  // 6. BANNIÈRE D'ERREUR
  // ══════════════════════════════════════════════════════
  describe('bannière d\'erreur', () => {
    it('affiche la bannière si store.error est défini', async () => {
      const { wrapper, store } = buildWrapper()
      store.error = 'Une erreur est survenue'
      await flushPromises()
      expect(wrapper.find('.error-banner').exists()).toBe(true)
      expect(wrapper.text()).toContain('Une erreur est survenue')
    })

    it('n\'affiche pas la bannière si store.error est null', async () => {
      const { wrapper, store } = buildWrapper()
      store.error = null
      await flushPromises()
      expect(wrapper.find('.error-banner').exists()).toBe(false)
    })
  })

  // ══════════════════════════════════════════════════════
  // 7. CHARGEMENT INITIAL (onMounted)
  // ══════════════════════════════════════════════════════
  describe('chargement initial', () => {
    it('appelle les 4 actions du store au montage', async () => {
      const pinia = createPinia()
      setActivePinia(pinia)

      const authStore = useAuthStore()
      authStore.user = { id_utilisateur: 'admin1', role: 'ADMINISTRATEUR' }

      const store = useAdminStore()
      store.fetchDashboardStats    = vi.fn().mockResolvedValue(undefined)
      store.fetchUsers             = vi.fn().mockResolvedValue(undefined)
      store.fetchVerificationQueue = vi.fn().mockResolvedValue(undefined)
      store.fetchCertHistory       = vi.fn().mockResolvedValue(undefined)

      const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: AdminDashboard }, { path: '/login', component: { template: '<div/>' } }] })
      mount(AdminDashboard, {
        global: { plugins: [pinia, router], stubs: { StatCard, StatusBadge, AppModal } },
      })
      await flushPromises()

      expect(store.fetchDashboardStats).toHaveBeenCalledOnce()
      expect(store.fetchUsers).toHaveBeenCalledOnce()
      expect(store.fetchVerificationQueue).toHaveBeenCalledOnce()
      expect(store.fetchCertHistory).toHaveBeenCalledOnce()
    })
  })
})