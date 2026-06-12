import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAdminStore } from '../../src/stores/adminStore'
import { useAuthStore } from '../../src/stores/authstore'
import api from '../../src/services/api'

// ── Mock de l'API ─────────────────────────────────────────
vi.mock('../../src/services/api', () => ({
  default: {
    get:    vi.fn(),
    post:   vi.fn(),
    patch:  vi.fn(),
    delete: vi.fn(),
  },
}))

// ── Mock authService pour éviter des appels réseau réels ──
vi.mock('../../src/services/auth.service', () => ({
  authService: { login: vi.fn(), register: vi.fn(), getMe: vi.fn() },
}))

function setupAdmin() {
  setActivePinia(createPinia())
  const auth = useAuthStore()
  auth.user = { id_utilisateur: 'admin1', role: 'ADMINISTRATEUR' }
  return useAdminStore()
}

// ═════════════════════════════════════════════════════════════════════════════
// TESTS UNITAIRES — adminStore
// ═════════════════════════════════════════════════════════════════════════════
describe('adminStore — Tests Unitaires', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ══════════════════════════════════════════════════════
  // 1. ÉTAT INITIAL
  // ══════════════════════════════════════════════════════
  describe('état initial', () => {
    it('initialise tous les tableaux vides', () => {
      const store = setupAdmin()
      expect(store.users).toEqual([])
      expect(store.verificationQueue).toEqual([])
      expect(store.students).toEqual([])
      expect(store.certHistory).toEqual([])
    })

    it('initialise les stats à zéro', () => {
      const store = setupAdmin()
      expect(store.stats.studentsActive).toBe(0)
      expect(store.stats.professors).toBe(0)
      expect(store.stats.partners).toBe(0)
    })

    it('initialise loading à false et error à null', () => {
      const store = setupAdmin()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  // ══════════════════════════════════════════════════════
  // 2. fetchDashboardStats
  // ══════════════════════════════════════════════════════
  describe('fetchDashboardStats()', () => {
    it('calcule les stats depuis la liste des utilisateurs', async () => {
      const mockUsers = [
        { role: 'ETUDIANT' },
        { role: 'ETUDIANT' },
        { role: 'PROFESSEUR' },
        { role: 'PROFESSIONNEL' },
      ]
      api.get.mockResolvedValueOnce({ data: mockUsers })

      const store = setupAdmin()
      await store.fetchDashboardStats()

      expect(api.get).toHaveBeenCalledWith('/utilisateurs/')
      expect(store.stats.studentsActive).toBe(2)
      expect(store.stats.professors).toBe(1)
      expect(store.stats.partners).toBe(1)
      expect(store.loading).toBe(false)
    })

    it('passe loading à true pendant le chargement puis false après', async () => {
      let resolvePromise
      api.get.mockReturnValueOnce(
        new Promise(res => { resolvePromise = res })
      )
      const store = setupAdmin()
      const p = store.fetchDashboardStats()
      expect(store.loading).toBe(true)
      resolvePromise({ data: [] })
      await p
      expect(store.loading).toBe(false)
    })

    it('stocke le message d\'erreur en cas d\'échec API', async () => {
      api.get.mockRejectedValueOnce({
        response: { data: { message: 'Accès refusé' } },
      })
      const store = setupAdmin()
      await store.fetchDashboardStats()
      expect(store.error).toBe('Accès refusé')
      expect(store.loading).toBe(false)
    })

    it('refuse si l\'utilisateur n\'est pas admin', async () => {
      setActivePinia(createPinia())
      const store = useAdminStore()
      await store.fetchDashboardStats()
      expect(store.error).toBe('Accès refusé')
      expect(api.get).not.toHaveBeenCalled()
    })
  })

  // ══════════════════════════════════════════════════════
  // 3. fetchUsers
  // ══════════════════════════════════════════════════════
  describe('fetchUsers()', () => {
    it('remplit users avec la réponse API', async () => {
      const mockUsers = [
        { id_utilisateur: '1', nom: 'Dupont', prenom: 'Jean' },
        { id_utilisateur: '2', nom: 'Martin', prenom: 'Marie' },
      ]
      api.get.mockResolvedValueOnce({ data: mockUsers })

      const store = setupAdmin()
      await store.fetchUsers()

      expect(api.get).toHaveBeenCalledWith('/utilisateurs/')
      expect(store.users).toEqual(mockUsers)
      expect(store.loading).toBe(false)
    })

    it('stocke l\'erreur en cas d\'échec', async () => {
      api.get.mockRejectedValueOnce({
        response: { data: { message: 'Non autorisé' } },
      })
      const store = setupAdmin()
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

      const store = setupAdmin()
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

      const store = setupAdmin()
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
      const store = setupAdmin()
      const result = await store.createUser({
        email: 'dup@b.fr', password: '12345678',
        firstName: 'X', lastName: 'Y', role: 'Étudiant',
      })
      expect(result.success).toBe(false)
      expect(result.message).toBe('Email déjà utilisé')
    })

    it('appelle fetchUsers après une création réussie', async () => {
      api.post.mockResolvedValueOnce({ data: {} })
      api.get.mockResolvedValueOnce({ data: [{ id_utilisateur: '1' }] })

      const store = setupAdmin()
      await store.createUser({
        email: 'a@b.fr', password: '12345678',
        firstName: 'A', lastName: 'B', role: 'Étudiant',
      })

      expect(api.get).toHaveBeenCalledWith('/utilisateurs/')
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

        const store = setupAdmin()
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
      const store = setupAdmin()
      store.users = [
        { id_utilisateur: 'aaa' },
        { id_utilisateur: 'bbb' },
      ]
      await store.deleteUser('aaa')
      expect(store.users).toEqual([{ id_utilisateur: 'bbb' }])
      expect(api.delete).toHaveBeenCalledWith('/utilisateurs/aaa')
    })

    it('stocke l\'erreur si la suppression échoue', async () => {
      api.delete.mockRejectedValueOnce({
        response: { data: { message: 'Suppression interdite' } },
      })
      const store = setupAdmin()
      store.users = [{ id_utilisateur: 'aaa' }]
      await store.deleteUser('aaa')
      expect(store.error).toBe('Suppression interdite')
      expect(store.users).toHaveLength(1)
    })
  })

  // ══════════════════════════════════════════════════════
  // 7. fetchVerificationQueue
  // ══════════════════════════════════════════════════════
  describe('fetchVerificationQueue()', () => {
    it('combine activités et professionnels dans verificationQueue', async () => {
      const mockActivite  = { id_activite: 'a1', nom_activite: 'Hackathon', description: 'Desc' }
      const mockPro       = { id_professionnel: 'p1', entreprise: 'TechCorp', poste: 'Dev' }

      api.get
        .mockResolvedValueOnce({ data: [mockActivite] })
        .mockResolvedValueOnce({ data: [mockPro] })

      const store = setupAdmin()
      await store.fetchVerificationQueue()

      expect(api.get).toHaveBeenCalledWith('/activites/a-valider')
      expect(api.get).toHaveBeenCalledWith('/professionnels/en-attente')
      expect(store.verificationQueue).toHaveLength(2)
      expect(store.verificationQueue[0].type).toBe('ACTIVITE')
      expect(store.verificationQueue[1].type).toBe('PROFESSIONNEL')
    })

    it('reste stable si une des deux APIs échoue (Promise.allSettled)', async () => {
      api.get
        .mockRejectedValueOnce(new Error('Network'))
        .mockResolvedValueOnce({ data: [{ id_professionnel: 'p1', entreprise: 'A' }] })

      const store = setupAdmin()
      await store.fetchVerificationQueue()

      expect(store.verificationQueue).toHaveLength(1)
      expect(store.verificationQueue[0].type).toBe('PROFESSIONNEL')
    })
  })

  // ══════════════════════════════════════════════════════
  // 8. validateEntity
  // ══════════════════════════════════════════════════════
  describe('validateEntity()', () => {
    it('valide une activité et la retire de la queue', async () => {
      api.post.mockResolvedValueOnce({})
      const store = setupAdmin()
      store.verificationQueue = [
        { id: 'a1', type: 'ACTIVITE' },
        { id: 'p1', type: 'PROFESSIONNEL' },
      ]
      const result = await store.validateEntity('ACTIVITE', 'a1', 'APPROUVE', 'Bien')

      expect(result.success).toBe(true)
      expect(api.post).toHaveBeenCalledWith('/activites/a1/valider', { decision: 'APPROUVE', commentaire: 'Bien' })
      expect(store.verificationQueue).toHaveLength(1)
      expect(store.verificationQueue[0].type).toBe('PROFESSIONNEL')
    })

    it('valide un professionnel avec api.patch', async () => {
      api.patch.mockResolvedValueOnce({})
      const store = setupAdmin()
      store.verificationQueue = [{ id: 'p1', type: 'PROFESSIONNEL' }]
      const result = await store.validateEntity('PROFESSIONNEL', 'p1', 'APPROUVE')

      expect(result.success).toBe(true)
      expect(api.patch).toHaveBeenCalledWith('/professionnels/p1/valider', { action: 'APPROUVE' })
      expect(store.verificationQueue).toHaveLength(0)
    })

    it('retourne success: false en cas d\'erreur', async () => {
      api.post.mockRejectedValueOnce({ response: { data: { message: 'Déjà traité' } } })
      const store = setupAdmin()
      store.verificationQueue = [{ id: 'a1', type: 'ACTIVITE' }]
      const result = await store.validateEntity('ACTIVITE', 'a1', 'APPROUVE')
      expect(result.success).toBe(false)
      expect(result.message).toBe('Déjà traité')
    })

    it('refuse si l\'utilisateur n\'est pas admin', async () => {
      setActivePinia(createPinia())
      const store = useAdminStore()
      const result = await store.validateEntity('ACTIVITE', 'a1', 'APPROUVE')
      expect(result.success).toBe(false)
      expect(result.message).toBe('Accès refusé')
    })
  })

  // ══════════════════════════════════════════════════════
  // 9. fetchCertHistory
  // ══════════════════════════════════════════════════════
  describe('fetchCertHistory()', () => {
    it('remplit certHistory avec la réponse API', async () => {
      const mockHist = [
        { id: 'h1', action: 'certifié', date: '2024-05-01' },
      ]
      api.get.mockResolvedValueOnce({ data: mockHist })

      const store = setupAdmin()
      await store.fetchCertHistory()

      expect(api.get).toHaveBeenCalledWith('/historique-actions/')
      expect(store.certHistory).toEqual(mockHist)
    })
  })

  // ══════════════════════════════════════════════════════
  // 10. fetchStudents
  // ══════════════════════════════════════════════════════
  describe('fetchStudents()', () => {
    it('remplit students avec la réponse API', async () => {
      const mockStudents = [{ id_utilisateur: 's1', nom: 'Martin' }]
      api.get.mockResolvedValueOnce({ data: mockStudents })

      const store = setupAdmin()
      await store.fetchStudents()

      expect(api.get).toHaveBeenCalledWith('/etudiants/')
      expect(store.students).toEqual(mockStudents)
    })
  })
})
