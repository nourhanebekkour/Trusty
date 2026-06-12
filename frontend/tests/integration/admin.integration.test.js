import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock de l'API utilisée par adminStore (src/services/api.js)
vi.mock('@/services/api', () => ({
  default: {
    get:    vi.fn(),
    post:   vi.fn(),
    put:    vi.fn(),
    patch:  vi.fn(),
    delete: vi.fn(),
    interceptors: { response: { use: vi.fn() } },
  }
}))

import { useAdminStore } from '@/stores/adminStore'
import { useAuthStore } from '@/stores/authstore'
import api from '@/services/api'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  // Définit un user ADMINISTRATEUR pour passer le guard isAdmin()
  const auth = useAuthStore()
  auth.user = { id_utilisateur: 'admin1', role: 'ADMINISTRATEUR' }
})

// ─────────────────────────────────────────────
describe('adminStore + adminApi — Tests d\'intégration', () => {

  it('1 — fetchDashboardStats : store → api.get /utilisateurs/ → stats calculées', async () => {
    const fakeUsers = [
      { id_utilisateur: 'u1', role: 'ETUDIANT' },
      { id_utilisateur: 'u2', role: 'ETUDIANT' },
      { id_utilisateur: 'u3', role: 'PROFESSEUR' },
      { id_utilisateur: 'u4', role: 'PROFESSIONNEL' },
    ]
    api.get.mockResolvedValue({ data: { data: fakeUsers } })

    const store = useAdminStore()
    await store.fetchDashboardStats()

    expect(api.get).toHaveBeenCalledWith('/utilisateurs/')
    expect(store.stats.studentsActive).toBe(2)
    expect(store.stats.professors).toBe(1)
    expect(store.stats.partners).toBe(1)
    expect(store.loading).toBe(false)
  })

  it('2 — fetchDashboardStats échoue : erreur stockée dans store.error', async () => {
    api.get.mockRejectedValue({ response: { data: { message: 'Accès refusé' } } })

    const store = useAdminStore()
    await store.fetchDashboardStats()

    expect(store.error).toBe('Accès refusé')
    expect(store.loading).toBe(false)
  })

  it('3 — fetchUsers : store → api.get /utilisateurs/ → users mis à jour', async () => {
    const fakeUsers = [
      { id_utilisateur: 'u1', prenom: 'Alice', nom: 'Martin', role: 'ETUDIANT' },
      { id_utilisateur: 'u2', prenom: 'Bob',   nom: 'Dupont', role: 'PROFESSEUR' },
    ]
    api.get.mockResolvedValue({ data: { data: fakeUsers } })

    const store = useAdminStore()
    await store.fetchUsers()

    expect(api.get).toHaveBeenCalledWith('/utilisateurs/')
    expect(store.users).toHaveLength(2)
    expect(store.users[0].prenom).toBe('Alice')
  })

  it('4 — fetchUsers avec liste vide : users = []', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })

    const store = useAdminStore()
    await store.fetchUsers()

    expect(store.users).toEqual([])
  })

  it('5 — fetchUsers échoue : erreur propagée dans store.error', async () => {
    api.get.mockRejectedValue({ response: { data: { message: 'Erreur serveur' } } })

    const store = useAdminStore()
    await store.fetchUsers()

    expect(store.error).toBe('Erreur serveur')
  })

  it('6 — fetchVerificationQueue : store → api.get /activites/a-valider + /professionnels/en-attente', async () => {
    api.get
      .mockResolvedValueOnce({ data: { data: [
        { id_activite: 'a1', nom_activite: 'Projet X', etudiant: { utilisateur: { prenom: 'Alice', nom: 'Dupont' } } }
      ]}})
      .mockResolvedValueOnce({ data: { data: [] } })

    const store = useAdminStore()
    await store.fetchVerificationQueue()

    expect(store.verificationQueue).toHaveLength(1)
    expect(store.verificationQueue[0].type).toBe('ACTIVITE')
    expect(store.verificationQueue[0].title).toBe('Projet X')
  })

  it('7 — validateEntity (ACTIVITE, VALIDE) : store → api.post → retiré de la queue', async () => {
    api.post.mockResolvedValue({ data: { success: true } })

    const store = useAdminStore()
    store.verificationQueue.push({ id: 'a1', type: 'ACTIVITE', title: 'Projet X' })
    store.verificationQueue.push({ id: 'a2', type: 'ACTIVITE', title: 'Projet Y' })

    const result = await store.validateEntity('ACTIVITE', 'a1', 'VALIDE', '')

    expect(api.post).toHaveBeenCalledWith('/activites/a1/valider', { decision: 'VALIDE' })
    expect(result.success).toBe(true)
    expect(store.verificationQueue).toHaveLength(1)
    expect(store.verificationQueue[0].id).toBe('a2')
  })

  it('8 — validateEntity échoue : retourne success=false avec message', async () => {
    api.post.mockRejectedValue({ response: { data: { message: 'Entité invalide' } } })

    const store = useAdminStore()
    store.verificationQueue.push({ id: 'a1', type: 'ACTIVITE' })

    const result = await store.validateEntity('ACTIVITE', 'a1', 'VALIDE', '')

    expect(result.success).toBe(false)
    expect(result.message).toBe('Entité invalide')
    expect(store.verificationQueue).toHaveLength(1) // non retiré
  })

  it('9 — fetchCertHistory : store → api.get /historique-actions/ → certHistory mis à jour', async () => {
    const fakeHistory = [
      { id: 'h1', action: 'CERTIFICATION', description: 'Portfolio certifié' }
    ]
    api.get.mockResolvedValue({ data: { data: fakeHistory } })

    const store = useAdminStore()
    await store.fetchCertHistory()

    expect(api.get).toHaveBeenCalledWith('/historique-actions/')
    expect(store.certHistory).toHaveLength(1)
  })

  it('10 — workflow : fetchUsers puis deleteUser → liste cohérente', async () => {
    api.get.mockResolvedValue({ data: { data: [
      { id_utilisateur: 'u1', prenom: 'Alice' },
      { id_utilisateur: 'u2', prenom: 'Bob'   },
    ]}})
    api.delete.mockResolvedValue({})

    const store = useAdminStore()
    await store.fetchUsers()
    expect(store.users).toHaveLength(2)

    await store.deleteUser('u1')
    expect(api.delete).toHaveBeenCalledWith('/utilisateurs/u1')
    expect(store.users).toHaveLength(1)
    expect(store.users[0].id_utilisateur).toBe('u2')
  })
})
