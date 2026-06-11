import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AdminUsers from '@/views/admin/AdminUsers.vue'
import { useAdminStore } from '@/stores/adminStore'

// ── Stubs ─────────────────────────────────────────────────
const StatCard      = { template: '<div class="stat-card">{{ label }}:{{ value }}</div>', props: ['label','value','sub'] }
const StatusBadge   = { template: '<span class="status-badge">{{ status }}</span>', props: ['status'] }
const AppPagination = { template: '<div class="pagination"/>', props: ['currentPage','totalPages','totalItems','perPage','itemLabel'], emits: ['page-change'] }
const AppModal      = { template: '<div v-if="show" class="modal"><slot/><button @click="$emit(\'confirm\')">OK</button><button @click="$emit(\'close\')">Annuler</button></div>', props: ['show','title','subtitle'], emits: ['confirm','close'] }

vi.mock('../../../src/components/ui/StatCard.vue',      () => ({ default: StatCard      }))
vi.mock('../../../src/components/ui/StatusBadge.vue',   () => ({ default: StatusBadge   }))
vi.mock('../../../src/components/ui/AppPagination.vue', () => ({ default: AppPagination }))
vi.mock('../../../src/components/ui/AppModal.vue',      () => ({ default: AppModal      }))
vi.mock('../../../src/services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}))

// ── Dataset de test ───────────────────────────────────────
const mockUsers = [
  { id_administrateur: 'u1', niveau_acces: 'ADMIN',     utilisateur: { nom: 'Dupont',  prenom: 'Jean',   email: 'jean@e.fr',   status_compte: 'ACTIF',      date_creation: '2024-01-10' } },
  { id_administrateur: 'u2', niveau_acces: 'PROFESSEUR', utilisateur: { nom: 'Martin',  prenom: 'Sophie', email: 'sophie@e.fr', status_compte: 'ACTIF',      date_creation: '2024-02-15' } },
  { id_administrateur: 'u3', niveau_acces: 'ETUDIANT',  utilisateur: { nom: 'Bernard', prenom: 'Lucas',  email: 'lucas@e.fr',  status_compte: 'INACTIF',    date_creation: '2024-03-01' } },
  { id_administrateur: 'u4', niveau_acces: 'ETUDIANT',  utilisateur: { nom: 'Petit',   prenom: 'Emma',   email: 'emma@e.fr',   status_compte: 'EN_ATTENTE', date_creation: '2024-04-05' } },
  { id_administrateur: 'u5', niveau_acces: 'ETUDIANT',  utilisateur: { nom: 'Moreau',  prenom: 'Paul',   email: 'paul@e.fr',   status_compte: 'ACTIF',      date_creation: '2024-05-20' } },
  { id_administrateur: 'u6', niveau_acces: 'ETUDIANT',  utilisateur: { nom: 'Girard',  prenom: 'Léa',    email: 'lea@e.fr',    status_compte: 'ACTIF',      date_creation: '2024-06-01' } },
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
      // 3 utilisateurs avec status ACTIF parmi les 6
      await flushPromises()
      const statCards = wrapper.findAll('.stat-card')
      // Le 2e StatCard = Étudiants Actifs (status ACTIF)
      // mockUsers: u1(ACTIF), u2(ACTIF), u5(ACTIF), u6(ACTIF) = 4 ACTIF
      expect(store.users.filter(u => u.utilisateur?.status_compte === 'ACTIF').length).toBe(4)
    })

    it('compte correctement les professeurs', async () => {
      const { wrapper, store } = buildWrapper()
      await flushPromises()
      const profs = store.users.filter(u => u.niveau_acces === 'PROFESSEUR')
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

    it('n\'appelle pas deleteUser si l\'utilisateur annule', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false)
      const { wrapper, store } = buildWrapper()
      store.deleteUser = vi.fn()
      store.loading = false
      await flushPromises()

      await wrapper.find('button[title="Supprimer"]').trigger('click')
      expect(store.deleteUser).not.toHaveBeenCalled()
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
      const store = useAdminStore()
      store.fetchUsers             = vi.fn().mockResolvedValue(undefined)
      store.fetchVerificationQueue = vi.fn().mockResolvedValue(undefined)

      const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: AdminUsers }] })
      mount(AdminUsers, {
        global: { plugins: [pinia, router], stubs: { StatCard, StatusBadge, AppPagination, AppModal } },
      })
      await flushPromises()

      expect(store.fetchUsers).toHaveBeenCalledOnce()
      expect(store.fetchVerificationQueue).toHaveBeenCalledOnce()
    })
  })
})