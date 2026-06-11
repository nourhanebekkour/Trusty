import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAdminStore } from '../../src/stores/adminStore'
import api from '../../src/services/api'

// ── Mock de l'API ─────────────────────────────────────────
vi.mock('../../src/services/api', () => ({
  default: {
    get:    vi.fn(),
    post:   vi.fn(),
    delete: vi.fn(),
  },
}))

// ═════════════════════════════════════════════════════════════════════════════
// TESTS UNITAIRES — adminStore
// api toujours mockée. Chaque action du store testée en isolation.
// ═════════════════════════════════════════════════════════════════════════════
describe('adminStore — Tests Unitaires', () => {

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // ══════════════════════════════════════════════════════
  // 1. ÉTAT INITIAL
  // ══════════════════════════════════════════════════════
  describe('état initial', () => {
    it('initialise tous les tableaux vides', () => {
      const store = useAdminStore()
      expect(store.users).toEqual([])
      expect(store.verificationQueue).toEqual([])
      expect(store.portfolios).toEqual([])
      expect(store.certHistory).toEqual([])
    })

    it('initialise les stats à zéro', () => {
      const store = useAdminStore()
      expect(store.stats.studentsActive).toBe(0)
      expect(store.stats.portfoliosCreated).toBe(0)
      expect(store.stats.professors).toBe(0)
      expect(store.stats.partners).toBe(0)
    })

    it('initialise loading à false et error à null', () => {
      const store = useAdminStore()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  // ══════════════════════════════════════════════════════
  // 2. fetchDashboardStats
  // ══════════════════════════════════════════════════════
  describe('fetchDashboardStats()', () => {
    it('met à jour stats avec la réponse API', async () => {
      const mockStats = {
        studentsActive: 120,
        portfoliosCreated: 85,
        professors: 14,
        partners: 32,
      }
      api.get.mockResolvedValueOnce({ data: mockStats })

      const store = useAdminStore()
      await store.fetchDashboardStats()

      expect(api.get).toHaveBeenCalledWith('/admin/stats')
      expect(store.stats).toEqual(mockStats)
      expect(store.loading).toBe(false)
    })

    it('passe loading à true pendant le chargement puis false après', async () => {
      let resolvePromise
      api.get.mockReturnValueOnce(
        new Promise(res => { resolvePromise = res })
      )
      const store = useAdminStore()
      const p = store.fetchDashboardStats()
      expect(store.loading).toBe(true)
      resolvePromise({ data: {} })
      await p
      expect(store.loading).toBe(false)
    })

    it('stocke le message d\'erreur en cas d\'échec API', async () => {
      api.get.mockRejectedValueOnce({
        response: { data: { message: 'Accès refusé' } },
      })
      const store = useAdminStore()
      await store.fetchDashboardStats()
      expect(store.error).toBe('Accès refusé')
      expect(store.loading).toBe(false)
    })

    it('utilise le message générique si pas de message d\'erreur', async () => {
      api.get.mockRejectedValueOnce(new Error('Network Error'))
      const store = useAdminStore()
      await store.fetchDashboardStats()
      expect(store.error).toBe('Erreur lors du chargement des stats')
    })
  })

  // ══════════════════════════════════════════════════════
  // 3. fetchUsers
  // ══════════════════════════════════════════════════════
  describe('fetchUsers()', () => {
    it('remplit users avec la réponse API', async () => {
      const mockUsers = [
        { id_administrateur: '1', utilisateur: { nom: 'Dupont', prenom: 'Jean' } },
        { id_administrateur: '2', utilisateur: { nom: 'Martin', prenom: 'Marie' } },
      ]
      api.get.mockResolvedValueOnce({ data: mockUsers })

      const store = useAdminStore()
      await store.fetchUsers()

      expect(api.get).toHaveBeenCalledWith('/admin/users')
      expect(store.users).toEqual(mockUsers)
      expect(store.loading).toBe(false)
    })

    it('stocke l\'erreur en cas d\'échec', async () => {
      api.get.mockRejectedValueOnce({
        response: { data: { message: 'Non autorisé' } },
      })
      const store = useAdminStore()
      await store.fetchUsers()
      expect(store.error).toBe('Non autorisé')
    })
  })

  // ══════════════════════════════════════════════════════
  // 4. createUser
  // ══════════════════════════════════════════════════════
  describe('createUser()', () => {
    it('envoie le bon payload au bon endpoint', async () => {
      api.post.mockResolvedValueOnce({ data: { id: '99' } })
      api.get.mockResolvedValueOnce({ data: [] }) // fetchUsers après création

      const store = useAdminStore()
      const userData = {
        email: 'jean@ecole.fr',
        password: 'Secret123',
        firstName: 'Jean',
        lastName: 'Dupont',
        role: 'Étudiant',
        phone: '0600000000',
      }
      const result = await store.createUser(userData)

      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        email: 'jean@ecole.fr',
        password: 'Secret123',
        prenom: 'Jean',
        nom: 'Dupont',
        role: 'ETUDIANT',
        telephone: '0600000000',
      })
      expect(result.success).toBe(true)
    })

    it('n\'inclut pas telephone si phone est vide', async () => {
      api.post.mockResolvedValueOnce({ data: {} })
      api.get.mockResolvedValueOnce({ data: [] })

      const store = useAdminStore()
      await store.createUser({
        email: 'a@b.fr', password: '12345678',
        firstName: 'A', lastName: 'B', role: 'Professeur',
      })

      const payload = api.post.mock.calls[0][1]
      expect(payload).not.toHaveProperty('telephone')
    })

    it('retourne success: false avec le message en cas d\'erreur', async () => {
      api.post.mockRejectedValueOnce({
        response: { data: { message: 'Email déjà utilisé' } },
      })
      const store = useAdminStore()
      const result = await store.createUser({
        email: 'dup@b.fr', password: '12345678',
        firstName: 'X', lastName: 'Y', role: 'Étudiant',
      })
      expect(result.success).toBe(false)
      expect(result.message).toBe('Email déjà utilisé')
    })

    it('appelle fetchUsers après une création réussie', async () => {
      api.post.mockResolvedValueOnce({ data: {} })
      api.get.mockResolvedValueOnce({ data: [{ id_administrateur: '1' }] })

      const store = useAdminStore()
      await store.createUser({
        email: 'a@b.fr', password: '12345678',
        firstName: 'A', lastName: 'B', role: 'Étudiant',
      })

      expect(api.get).toHaveBeenCalledWith('/admin/users')
    })
  })

  // ══════════════════════════════════════════════════════
  // 5. mapRoleToEnum (via createUser)
  // ══════════════════════════════════════════════════════
  describe('mapRoleToEnum (via createUser)', () => {
    const roles = [
      ['Étudiant',       'ETUDIANT'],
      ['Professeur',     'PROFESSEUR'],
      ['Administrateur', 'ADMINISTRATEUR'],
      ['Professionnel',  'PROFESSIONNEL'],
      ['Inconnu',        'ETUDIANT'], // fallback
    ]

    roles.forEach(([label, expected]) => {
      it(`mappe "${label}" → "${expected}"`, async () => {
        api.post.mockResolvedValueOnce({ data: {} })
        api.get.mockResolvedValueOnce({ data: [] })

        const store = useAdminStore()
        await store.createUser({
          email: 'a@b.fr', password: '12345678',
          firstName: 'A', lastName: 'B', role: label,
        })
        expect(api.post.mock.calls[0][1].role).toBe(expected)
      })
    })
  })

  // ══════════════════════════════════════════════════════
  // 6. deleteUser
  // ══════════════════════════════════════════════════════
  describe('deleteUser()', () => {
    it('supprime l\'utilisateur de la liste locale', async () => {
      api.delete.mockResolvedValueOnce({})
      const store = useAdminStore()
      store.users = [
        { id_administrateur: 'aaa' },
        { id_administrateur: 'bbb' },
      ]
      await store.deleteUser('aaa')
      expect(store.users).toEqual([{ id_administrateur: 'bbb' }])
      expect(api.delete).toHaveBeenCalledWith('/admin/users/aaa')
    })

    it('stocke l\'erreur si la suppression échoue', async () => {
      api.delete.mockRejectedValueOnce({
        response: { data: { message: 'Suppression interdite' } },
      })
      const store = useAdminStore()
      store.users = [{ id_administrateur: 'aaa' }]
      await store.deleteUser('aaa')
      expect(store.error).toBe('Suppression interdite')
      // La liste reste inchangée en cas d'erreur
      expect(store.users).toHaveLength(1)
    })
  })

  // ══════════════════════════════════════════════════════
  // 7. fetchVerificationQueue
  // ══════════════════════════════════════════════════════
  describe('fetchVerificationQueue()', () => {
    it('remplit verificationQueue avec la réponse API', async () => {
      const mockQueue = [
        { id: '1', studentName: 'Jean Dupont', type: 'PROJET', description: 'Projet IA', createdAt: '2024-05-01' },
      ]
      api.get.mockResolvedValueOnce({ data: mockQueue })

      const store = useAdminStore()
      await store.fetchVerificationQueue()

      expect(api.get).toHaveBeenCalledWith('/admin/verifications')
      expect(store.verificationQueue).toEqual(mockQueue)
    })
  })

  // ══════════════════════════════════════════════════════
  // 8. certifyPortfolio
  // ══════════════════════════════════════════════════════
  describe('certifyPortfolio()', () => {
    it('retire l\'item de la verificationQueue et retourne success: true', async () => {
      api.post.mockResolvedValueOnce({})
      const store = useAdminStore()
      store.verificationQueue = [
        { id: '1', studentName: 'A' },
        { id: '2', studentName: 'B' },
      ]
      const result = await store.certifyPortfolio('1')

      expect(result.success).toBe(true)
      expect(store.verificationQueue).toEqual([{ id: '2', studentName: 'B' }])
      expect(api.post).toHaveBeenCalledWith('/admin/portfolios/1/certify')
    })

    it('retourne success: false avec le message en cas d\'erreur', async () => {
      api.post.mockRejectedValueOnce({
        response: { data: { message: 'Déjà certifié' } },
      })
      const store = useAdminStore()
      store.verificationQueue = [{ id: '1' }]
      const result = await store.certifyPortfolio('1')
      expect(result.success).toBe(false)
      expect(result.message).toBe('Déjà certifié')
    })
  })

  // ══════════════════════════════════════════════════════
  // 9. requestCorrections
  // ══════════════════════════════════════════════════════
  describe('requestCorrections()', () => {
    it('envoie la note au bon endpoint et retourne success: true', async () => {
      api.post.mockResolvedValueOnce({})
      const store = useAdminStore()
      const result = await store.requestCorrections('42', 'Manque la bibliographie')

      expect(api.post).toHaveBeenCalledWith(
        '/admin/portfolios/42/corrections',
        { note: 'Manque la bibliographie' }
      )
      expect(result.success).toBe(true)
    })

    it('retourne success: false en cas d\'erreur', async () => {
      api.post.mockRejectedValueOnce({ response: { data: { message: 'Erreur serveur' } } })
      const store = useAdminStore()
      const result = await store.requestCorrections('42', 'note')
      expect(result.success).toBe(false)
      expect(result.message).toBe('Erreur serveur')
    })
  })

  // ══════════════════════════════════════════════════════
  // 10. fetchCertHistory
  // ══════════════════════════════════════════════════════
  describe('fetchCertHistory()', () => {
    it('remplit certHistory avec la réponse API', async () => {
      const mockHist = [
        { id: 'h1', validatorName: 'Admin A', actionLabel: 'certifié', entityType: 'projet', entityTitle: 'Projet IA', targetName: 'Jean Dupont', createdAt: '2024-05-01' },
      ]
      api.get.mockResolvedValueOnce({ data: mockHist })

      const store = useAdminStore()
      await store.fetchCertHistory()

      expect(api.get).toHaveBeenCalledWith('/admin/certifications/history')
      expect(store.certHistory).toEqual(mockHist)
    })
  })

  // ══════════════════════════════════════════════════════
  // 11. fetchPortfolios
  // ══════════════════════════════════════════════════════
  describe('fetchPortfolios()', () => {
    it('remplit portfolios avec la réponse API', async () => {
      const mockPortfolios = [{ id_portfolio: 'p1', titre_personnalise: 'Mon Portfolio' }]
      api.get.mockResolvedValueOnce({ data: mockPortfolios })

      const store = useAdminStore()
      await store.fetchPortfolios()

      expect(api.get).toHaveBeenCalledWith('/admin/portfolios')
      expect(store.portfolios).toEqual(mockPortfolios)
    })
  })
})