import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock de l'API legacy utilisée par adminStore (src/services/api.js)
vi.mock('@/services/api', () => ({
  default: {
    get:    vi.fn(),
    post:   vi.fn(),
    put:    vi.fn(),
    delete: vi.fn(),
    interceptors: { response: { use: vi.fn() } },
  }
}))

import { useAdminStore } from '@/stores/adminStore'
import api from '@/services/api'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

// ─────────────────────────────────────────────
describe('adminStore + adminApi — Tests d\'intégration', () => {

  it('1 — fetchDashboardStats : store → api.get /admin/stats → stats mis à jour', async () => {
    const fakeStats = { studentsActive: 120, portfoliosCreated: 45, professors: 12, partners: 8 }
    api.get.mockResolvedValue({ data: fakeStats })

    const store = useAdminStore()
    await store.fetchDashboardStats()

    expect(api.get).toHaveBeenCalledWith('/admin/stats')
    expect(store.stats.studentsActive).toBe(120)
    expect(store.stats.portfoliosCreated).toBe(45)
    expect(store.loading).toBe(false)
  })

  it('2 — fetchDashboardStats échoue : erreur stockée dans store.error', async () => {
    api.get.mockRejectedValue({ response: { data: { message: 'Accès refusé' } } })

    const store = useAdminStore()
    await store.fetchDashboardStats()

    expect(store.error).toBe('Accès refusé')
    expect(store.loading).toBe(false)
  })

  it('3 — fetchUsers : store → api.get /admin/users → users mis à jour', async () => {
    const fakeUsers = [
      { id_utilisateur: 'u1', prenom: 'Alice', nom: 'Martin', role: 'ETUDIANT' },
      { id_utilisateur: 'u2', prenom: 'Bob',   nom: 'Dupont', role: 'PROFESSEUR' },
    ]
    api.get.mockResolvedValue({ data: fakeUsers })

    const store = useAdminStore()
    await store.fetchUsers()

    expect(api.get).toHaveBeenCalledWith('/admin/users')
    expect(store.users).toHaveLength(2)
    expect(store.users[0].prenom).toBe('Alice')
  })

  it('4 — fetchUsers avec liste vide : users = []', async () => {
    api.get.mockResolvedValue({ data: [] })

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

  it('6 — fetchPortfolios : store → api.get /admin/portfolios → portfolios mis à jour', async () => {
    const fakePortfolios = [
      { id: 'p1', etudiant: 'Alice Martin', statut: 'EN_ATTENTE' },
      { id: 'p2', etudiant: 'Bob Dupont',   statut: 'VALIDE' },
    ]
    api.get.mockResolvedValue({ data: fakePortfolios })

    const store = useAdminStore()
    await store.fetchPortfolios()

    expect(api.get).toHaveBeenCalledWith('/admin/portfolios')
    expect(store.portfolios).toHaveLength(2)
  })

  it('7 — certifyPortfolio : store → api.post /admin/portfolios/:id/certify → retiré de la queue', async () => {
    api.post.mockResolvedValue({ data: { success: true } })

    const store = useAdminStore()
    store.verificationQueue.push({ id: 'p1', etudiant: 'Alice' })
    store.verificationQueue.push({ id: 'p2', etudiant: 'Bob' })

    const result = await store.certifyPortfolio('p1')

    expect(api.post).toHaveBeenCalledWith('/admin/portfolios/p1/certify')
    expect(result.success).toBe(true)
    expect(store.verificationQueue).toHaveLength(1)
    expect(store.verificationQueue[0].id).toBe('p2')
  })

  it('8 — certifyPortfolio échoue : retourne success=false avec message', async () => {
    api.post.mockRejectedValue({ response: { data: { message: 'Portfolio invalide' } } })

    const store = useAdminStore()
    store.verificationQueue.push({ id: 'p1' })

    const result = await store.certifyPortfolio('p1')

    expect(result.success).toBe(false)
    expect(result.message).toBe('Portfolio invalide')
    expect(store.verificationQueue).toHaveLength(1) // non retiré
  })

  it('9 — fetchCertHistory : store → api.get /admin/certifications/history → certHistory mis à jour', async () => {
    const fakeHistory = [
      { id: 'h1', validatorName: 'Prof Dupont', actionLabel: 'certifié', entityType: 'portfolio' }
    ]
    api.get.mockResolvedValue({ data: fakeHistory })

    const store = useAdminStore()
    await store.fetchCertHistory()

    expect(api.get).toHaveBeenCalledWith('/admin/certifications/history')
    expect(store.certHistory).toHaveLength(1)
  })

  it('10 — workflow : fetchUsers puis deleteUser → liste cohérente', async () => {
    api.get.mockResolvedValue({ data: [
      { id_administrateur: 'u1', prenom: 'Alice' },
      { id_administrateur: 'u2', prenom: 'Bob'   },
    ]})
    api.delete.mockResolvedValue({})

    const store = useAdminStore()
    await store.fetchUsers()
    expect(store.users).toHaveLength(2)

    await store.deleteUser('u1')
    expect(api.delete).toHaveBeenCalledWith('/admin/users/u1')
    expect(store.users).toHaveLength(1)
    expect(store.users[0].id_administrateur).toBe('u2')
  })
})
