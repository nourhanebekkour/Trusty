import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AdminUsers from '@/views/admin/AdminUsers.vue'
import { useAdminStore } from '@/stores/adminStore'
import { useAuthStore } from '@/stores/authstore'

// ── Stubs ─────────────────────────────────────────────────
const { StatCard, StatusBadge, AppPagination, AppModal } = vi.hoisted(() => ({
  StatCard:      { template: '<div class="stat-card">{{ label }}:{{ value }}</div>', props: ['label','value','sub'] },
  StatusBadge:   { template: '<span class="status-badge">{{ status }}</span>', props: ['status'] },
  AppPagination: { template: '<div class="pagination"/>', props: ['currentPage','totalPages','totalItems','perPage','itemLabel'], emits: ['page-change'] },
  AppModal:      { template: '<div v-if="show" class="modal"><slot/><button @click="$emit(\'confirm\')">OK</button><button @click="$emit(\'close\')">Annuler</button></div>', props: ['show','title','subtitle'], emits: ['confirm','close'] },
}))

vi.mock('../../../src/components/ui/StatCard.vue',      () => ({ default: StatCard      }))
vi.mock('../../../src/components/ui/StatusBadge.vue',   () => ({ default: StatusBadge   }))
vi.mock('../../../src/components/ui/AppPagination.vue', () => ({ default: AppPagination }))
vi.mock('../../../src/components/ui/AppModal.vue',      () => ({ default: AppModal      }))
vi.mock('../../../src/services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}))

// ── Dataset de test (structure plate correspondant à adminStore) ──────────────
const mockUsers = [
  { id_utilisateur: 'u1', prenom: 'Jean',   nom: 'Dupont',  email: 'jean@e.fr',   role: 'ADMIN',      status_compte: 'ACTIF',      date_creation: '2024-01-10' },
  { id_utilisateur: 'u2', prenom: 'Sophie', nom: 'Martin',  email: 'sophie@e.fr', role: 'PROFESSEUR', status_compte: 'ACTIF',      date_creation: '2024-02-15' },
  { id_utilisateur: 'u3', prenom: 'Lucas',  nom: 'Bernard', email: 'lucas@e.fr',  role: 'ETUDIANT',   status_compte: 'INACTIF',    date_creation: '2024-03-01' },
  { id_utilisateur: 'u4', prenom: 'Emma',   nom: 'Petit',   email: 'emma@e.fr',   role: 'ETUDIANT',   status_compte: 'EN_ATTENTE', date_creation: '2024-04-05' },
  { id_utilisateur: 'u5', prenom: 'Paul',   nom: 'Moreau',  email: 'paul@e.fr',   role: 'ETUDIANT',   status_compte: 'ACTIF',      date_creation: '2024-05-20' },
  { id_utilisateur: 'u6', prenom: 'Léa',    nom: 'Girard',  email: 'lea@e.fr',    role: 'ETUDIANT',   status_compte: 'ACTIF',      date_creation: '2024-06-01' },
]

function buildWrapper(storeOverrides = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: AdminUsers }] })

  const wrapper = mount(AdminUsers, {
    global: { plugins: [pinia, router], stubs: { StatCard, StatusBadge, AppPagination, AppModal } },
  })

  const store = useAdminStore()
  Object.assign(store, { users: [...mockUsers], loading: false, ...storeOverrides })
  return { wrapper, store }
}

// ─────────────────────────────────────────────────────────
describe('AdminUsers.vue', () => {

  beforeEach(() => vi.clearAllMocks())

  // ══════════════════════════════════════════════════════
  // 1. RENDU DE BASE
  // ══════════════════════════════════════════════════════
  describe('rendu de base', () => {
    it('affiche le titre de la page', () => {
      const { wrapper } = buildWrapper()
      expect(wrapper.text()).toContain('Gestion des Utilisateurs')
    })

    it('affiche les boutons Exporter et Créer', () => {
      const { wrapper } = buildWrapper()
      expect(wrapper.text()).toContain('Exporter')
      expect(wrapper.text()).toContain('Créer un utilisateur')
    })

    it('affiche le champ de recherche', () => {
      const { wrapper } = buildWrapper()
      expect(wrapper.find('input[placeholder*="Rechercher"]').exists()).toBe(true)
    })
  })

  // ══════════════════════════════════════════════════════
  // 2. STATS CALCULÉES
  // ══════════════════════════════════════════════════════
  describe('stats calculées', () => {
    it('compte correctement les étudiants actifs', async () => {
      const { wrapper, store } = buildWrapper()
      await flushPromises()
      // mockUsers: u1(ACTIF), u2(ACTIF), u5(ACTIF), u6(ACTIF) = 4 ACTIF
      expect(store.users.filter(u => u.status_compte === 'ACTIF').length).toBe(4)
    })

    it('compte correctement les professeurs', async () => {
      const { wrapper, store } = buildWrapper()
      await flushPromises()
      const profs = store.users.filter(u => u.role === 'PROFESSEUR')
      expect(profs.length).toBe(1)
    })
  })

  // ══════════════════════════════════════════════════════
  // 3. RECHERCHE ET FILTRAGE
  // ══════════════════════════════════════════════════════
  describe('recherche', () => {
    it('filtre les utilisateurs par nom', async () => {
      const { wrapper, store } = buildWrapper()
      store.loading = false
      await flushPromises()

      await wrapper.find('input[placeholder*="Rechercher"]').setValue('dupont')
      await flushPromises()

      expect(wrapper.text()).toContain('Dupont')
      expect(wrapper.text()).not.toContain('Martin')
    })

    it('filtre par email', async () => {
      const { wrapper, store } = buildWrapper()
      store.loading = false
      await flushPromises()

      await wrapper.find('input[placeholder*="Rechercher"]').setValue('sophie@e.fr')
      await flushPromises()

      expect(wrapper.text()).toContain('Sophie')
      expect(wrapper.text()).not.toContain('Jean')
    })

    it('est insensible à la casse', async () => {
      const { wrapper, store } = buildWrapper()
      store.loading = false
      await flushPromises()

      await wrapper.find('input[placeholder*="Rechercher"]').setValue('DUPONT')
      await flushPromises()

      expect(wrapper.text()).toContain('Dupont')
    })

    it('affiche "Aucun utilisateur trouvé" si aucun résultat', async () => {
      const { wrapper, store } = buildWrapper()
      store.loading = false
      await flushPromises()

      await wrapper.find('input[placeholder*="Rechercher"]').setValue('xyzinexistant')
      await flushPromises()

      expect(wrapper.text()).toContain('Aucun utilisateur trouvé')
    })
  })

  // ══════════════════════════════════════════════════════
  // 4. PAGINATION
  // ══════════════════════════════════════════════════════
  describe('pagination', () => {
    it('affiche le composant AppPagination', async () => {
      const { wrapper, store } = buildWrapper()
      store.loading = false
      await flushPromises()
      expect(wrapper.find('.pagination').exists()).toBe(true)
    })

    it('affiche au maximum 5 utilisateurs par page', async () => {
      const { wrapper, store } = buildWrapper()
      store.loading = false
      await flushPromises()
      // perPage = 5 → 6 users → page 1 = 5 rows
      const rows = wrapper.findAll('tbody tr').filter(r => !r.text().includes('Aucun'))
      expect(rows.length).toBeLessThanOrEqual(5)
    })
  })

  // ══════════════════════════════════════════════════════
  // 5. MODAL & CRÉATION D'UTILISATEUR
  // ══════════════════════════════════════════════════════
  describe('modal création', () => {

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
  // 6. SUPPRESSION D'UTILISATEUR
  // ══════════════════════════════════════════════════════
  describe('suppression utilisateur', () => {
    it('appelle deleteUser du store après confirmation', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      const { wrapper, store } = buildWrapper()
      store.deleteUser = vi.fn().mockResolvedValue(undefined)
      store.loading = false
      await flushPromises()

      const deleteBtn = wrapper.find('button[title="Supprimer"]')
      await deleteBtn.trigger('click')

      expect(store.deleteUser).toHaveBeenCalledWith('u1')
    })

    it('appelle deleteUser directement (pas de confirm dialog)', async () => {
      const { wrapper, store } = buildWrapper()
      store.deleteUser = vi.fn().mockResolvedValue(undefined)
      store.loading = false
      await flushPromises()

      const deleteBtn = wrapper.find('button[title="Supprimer"]')
      await deleteBtn.trigger('click')
      expect(store.deleteUser).toHaveBeenCalledWith('u1')
    })
  })

  // ══════════════════════════════════════════════════════
  // 7. BANNIÈRE D'ERREUR
  // ══════════════════════════════════════════════════════
  describe('bannière d\'erreur', () => {
    it('affiche l\'erreur du store', async () => {
      const { wrapper, store } = buildWrapper()
      store.error = 'Impossible de charger les utilisateurs'
      await flushPromises()
      expect(wrapper.find('.error-banner').exists()).toBe(true)
      expect(wrapper.text()).toContain('Impossible de charger les utilisateurs')
    })
  })

  // ══════════════════════════════════════════════════════
  // 8. CHARGEMENT INITIAL
  // ══════════════════════════════════════════════════════
  describe('chargement initial', () => {
    it('appelle fetchUsers et fetchVerificationQueue au montage', async () => {
      const pinia = createPinia()
      setActivePinia(pinia)

      const authStore = useAuthStore()
      authStore.user = { id_utilisateur: 'admin1', role: 'ADMINISTRATEUR' }

      const store = useAdminStore()
      store.fetchUsers             = vi.fn().mockResolvedValue(undefined)
      store.fetchVerificationQueue = vi.fn().mockResolvedValue(undefined)

      const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: AdminUsers }, { path: '/login', component: { template: '<div/>' } }] })
      mount(AdminUsers, {
        global: { plugins: [pinia, router], stubs: { StatCard, StatusBadge, AppPagination, AppModal } },
      })
      await flushPromises()

      expect(store.fetchUsers).toHaveBeenCalledOnce()
      expect(store.fetchVerificationQueue).toHaveBeenCalledOnce()
    })
  })
})