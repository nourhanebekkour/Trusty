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
      // setupAdmin crée un admin sans ecole → isSuperAdmin() = true
      // Le store appelle /etudiants/ et /professeurs/ en parallèle
      const mockEtudiants = [
        { utilisateur: { status_compte: 'ACTIF' } },
        { utilisateur: { status_compte: 'ACTIF' } },
        { utilisateur: { status_compte: 'INACTIF' } },
      ]
      const mockProfesseurs = [
        { utilisateur: { nom: 'Prof1' } },
      ]
      api.get
        .mockResolvedValueOnce({ data: mockEtudiants })
        .mockResolvedValueOnce({ data: mockProfesseurs })

      const store = setupAdmin()
      await store.fetchDashboardStats()

      expect(api.get).toHaveBeenCalledWith('/etudiants/')
      expect(api.get).toHaveBeenCalledWith('/professeurs/')
      expect(store.stats.studentsActive).toBe(2)
      expect(store.stats.professors).toBe(1)
      expect(store.stats.partners).toBe(0)
      expect(store.loading).toBe(false)
    })

    it('passe loading à true pendant le chargement puis false après', async () => {
      let resolvePromise
      api.get
        .mockReturnValueOnce(new Promise(res => { resolvePromise = res }))
        .mockReturnValueOnce(new Promise(res => res({ data: [] })))
      const store = setupAdmin()
      const p = store.fetchDashboardStats()
      expect(store.loading).toBe(true)
      resolvePromise({ data: [] })
      await p
      expect(store.loading).toBe(false)
    })

    it('stocke le message d\'erreur en cas d\'échec API', async () => {
      api.get
        .mockRejectedValueOnce({ response: { data: { message: 'Accès refusé' } } })
        .mockRejectedValueOnce({ response: { data: { message: 'Accès refusé' } } })
      const store = setupAdmin()
      await store.fetchDashboardStats()
      expect(store.error).toBe('Accès refusé')
      expect(store.loading).toBe(false)
    })

    it('refuse si l\'utilisateur n\'est pas admin', async () => {
      setActivePinia(createPinia())
      // useAuthStore() will have user=null by default → isAdmin() returns false
      const store = useAdminStore()
      await store.fetchDashboardStats()
      expect(store.error).toBe('Accès refusé')
      // No API calls because of the guard
      expect(api.get).not.toHaveBeenCalled()
    })
  })

  // ══════════════════════════════════════════════════════
  // 3. fetchUsers
  // ══════════════════════════════════════════════════════
  describe('fetchUsers()', () => {
    it('remplit users avec la réponse API', async () => {
      // The store fetches /etudiants/ and /professeurs/ (for superAdmin without ecole)
      // and normalizes results
      api.get
        .mockResolvedValueOnce({ data: [{ id_etudiant: '1', utilisateur: { nom: 'Dupont', prenom: 'Jean', status_compte: 'ACTIF' } }] })
        .mockResolvedValueOnce({ data: [] })

      const store = setupAdmin()
      await store.fetchUsers()

      expect(api.get).toHaveBeenCalledWith('/etudiants/')
      expect(api.get).toHaveBeenCalledWith('/professeurs/')
      expect(store.users).toHaveLength(1)
      expect(store.users[0].nom).toBe('Dupont')
      expect(store.loading).toBe(false)
    })

    it('stocke l\'erreur en cas d\'échec', async () => {
      api.get
        .mockRejectedValueOnce({ response: { data: { message: 'Non autorisé' } } })
        .mockRejectedValueOnce({ response: { data: { message: 'Non autorisé' } } })
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
      // fetchUsers calls /etudiants/ and /professeurs/
      api.get.mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({ data: [] })

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
      api.get.mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({ data: [] })

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
      // fetchUsers calls both /etudiants/ and /professeurs/
      api.get
        .mockResolvedValueOnce({ data: [{ id_etudiant: '1', utilisateur: {} }] })
        .mockResolvedValueOnce({ data: [] })

      const store = setupAdmin()
      await store.createUser({
        email: 'a@b.fr', password: '12345678',
        firstName: 'A', lastName: 'B', role: 'Étudiant',
      })

      expect(api.get).toHaveBeenCalledWith('/etudiants/')
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
        api.get.mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({ data: [] })

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
    it('combine activités dans verificationQueue', async () => {
      // The store only fetches /activites/a-valider (for non-superAdmin)
      // or /activites/?status_validation=EN_ATTENTE (for superAdmin)
      // setupAdmin creates user without ecole → isSuperAdmin() = true
      // So it uses /activites/?status_validation=EN_ATTENTE
      const mockActivite  = { id_activite: 'a1', nom_activite: 'Hackathon', description: 'Desc' }

      api.get.mockResolvedValueOnce({ data: [mockActivite] })

      const store = setupAdmin()
      await store.fetchVerificationQueue()

      expect(store.verificationQueue).toHaveLength(1)
      expect(store.verificationQueue[0].type).toBe('ACTIVITE')
    })

    it('appelle /activites/a-valider pour un admin non super', async () => {
      // Create a normal admin (with ecole) → not superAdmin
      setActivePinia(createPinia())
      const auth = useAuthStore()
      auth.user = { id_utilisateur: 'admin1', role: 'ADMINISTRATEUR', ecole: 'ENSATanger' }
      const store = useAdminStore()

      api.get.mockResolvedValueOnce({ data: [] })
      await store.fetchVerificationQueue()

      expect(api.get).toHaveBeenCalledWith('/activites/a-valider')
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

    it('valide un professionnel — retourne success (aucun appel API direct via validateEntity)', async () => {
      // The actual store's validateEntity only handles ACTIVITE type
      // For PROFESSIONNEL, use validateProfessional() instead
      // validateEntity with unknown type just filters the queue without API call
      const store = setupAdmin()
      store.verificationQueue = [{ id: 'p1', type: 'PROFESSIONNEL' }]
      const result = await store.validateEntity('PROFESSIONNEL', 'p1', 'APPROUVE')

      // Result is success:true (no error thrown), queue is filtered
      expect(result.success).toBe(true)
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
      // extractData(res) where res.data = mockHist → returns mockHist
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

      // setupAdmin creates superAdmin (no ecole) → calls /etudiants/
      expect(api.get).toHaveBeenCalledWith('/etudiants/')
      // extractData({data: mockStudents}) returns mockStudents
      expect(store.students).toEqual(mockStudents)
    })
  })
})
