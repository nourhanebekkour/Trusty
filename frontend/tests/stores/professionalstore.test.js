import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/stores/authstore', () => ({
  useAuthStore: vi.fn(() => ({ user: { role: 'PROFESSIONNEL' } }))
}))

vi.mock('@/services/professionalservices.js', () => ({
  fetchCandidats:         vi.fn(),
  envoyerRecommandation:  vi.fn(),
  fetchNotifications:     vi.fn(),
  marquerNotificationLue: vi.fn(),
}))

import { useProfessionalStore, normaliserCandidat, normaliserNotif } from '@/stores/professionalStore'
import * as svc from '@/services/professionalservices.js'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

// ─────────────────────────────────────────────
describe('normaliserCandidat', () => {
  it('retourne nom complet et initiales', () => {
    const c = normaliserCandidat({ id_etudiant: 'abc', utilisateur: { prenom: 'Ali', nom: 'Ben' }, score_credibilite: 80 })
    expect(c.nom).toBe('Ali Ben')
    expect(c.initiales).toBe('AB')
    expect(c.score).toBe(80)
  })

  it('retourne nom de secours si utilisateur absent', () => {
    const c = normaliserCandidat({ id_etudiant: 'xyz123' })
    expect(c.nom).toContain('Étudiant')
    expect(c.initiales).toBe('??')
  })
})

// ─────────────────────────────────────────────
describe('normaliserNotif', () => {
  it('formate la notification correctement', () => {
    const n = normaliserNotif({ id_notification: 1, titre: 'Test', message: 'Msg', date_creation: new Date().toISOString(), est_lue: false }, 0, 1)
    expect(n.id).toBe(1)
    expect(n.color).toBe('#66c99f')
    expect(n.last).toBe(true)
  })

  it('indique last=false si ce n\'est pas le dernier', () => {
    const n = normaliserNotif({ id_notification: 2, titre: '', message: '', date_creation: new Date().toISOString(), est_lue: true }, 0, 3)
    expect(n.last).toBe(false)
    expect(n.color).toBe('#a0b4ae')
  })
})

// ─────────────────────────────────────────────
describe('ProfessionalStore — chargerCandidats', () => {
  it('charge et normalise les candidats', async () => {
    svc.fetchCandidats.mockResolvedValue([
      { id_etudiant: 1, utilisateur: { prenom: 'Alice', nom: 'Dupont' }, score_credibilite: 90 }
    ])
    const store = useProfessionalStore()
    await store.chargerCandidats()
    expect(store.candidats).toHaveLength(1)
    expect(store.candidats[0].nom).toBe('Alice Dupont')
    expect(store.loading.candidats).toBe(false)
  })

  it('stocke l\'erreur si l\'API échoue', async () => {
    svc.fetchCandidats.mockRejectedValue(new Error('Network error'))
    const store = useProfessionalStore()
    await store.chargerCandidats()
    expect(store.erreur).toBe('Network error')
    expect(store.candidats).toHaveLength(0)
  })
})

// ─────────────────────────────────────────────
describe('ProfessionalStore — chargerNotifications', () => {
  it('charge et normalise les notifications', async () => {
    svc.fetchNotifications.mockResolvedValue([
      { id_notification: 1, titre: 'Notif', message: 'msg', date_creation: new Date().toISOString(), est_lue: false }
    ])
    const store = useProfessionalStore()
    await store.chargerNotifications()
    expect(store.notifications).toHaveLength(1)
  })
})

// ─────────────────────────────────────────────
describe('ProfessionalStore — envoyerRecommandation', () => {
  it('envoie une recommandation et met à jour recsEmises', async () => {
    svc.envoyerRecommandation.mockResolvedValue({})
    const store = useProfessionalStore()
    const candidat = { id: 1, nom: 'Alice', initiales: 'AD', gradient: '' }
    await store.envoyerRecommandation(candidat, 'Excellent candidat', 'officielle')
    expect(store.recsEmises).toHaveLength(1)
    expect(store.recsEmises[0].candidatId).toBe(1)
  })

  it('stocke l\'erreur API dans erreur si l\'API échoue', async () => {
    svc.envoyerRecommandation.mockRejectedValue(new Error('Erreur API'))
    const store = useProfessionalStore()
    const candidat = { id: 1, nom: 'Alice', initiales: 'AD', gradient: '' }
    await expect(store.envoyerRecommandation(candidat, 'message', 'officielle')).rejects.toThrow('Erreur API')
    expect(store.erreur).toBe('Erreur API')
  })
})

// ─────────────────────────────────────────────
describe('ProfessionalStore — actions locales', () => {
  it('toggleFavori ajoute et retire un favori', () => {
    const store = useProfessionalStore()
    store.toggleFavori('id-1')
    expect(store.favoris).toContain('id-1')
    store.toggleFavori('id-1')
    expect(store.favoris).not.toContain('id-1')
  })

  it('aRecommande retourne true si recommandation envoyée', () => {
    const store = useProfessionalStore()
    store.recsEmises.push({ candidatId: 'xyz' })
    expect(store.aRecommande('xyz')).toBe(true)
    expect(store.aRecommande('abc')).toBe(false)
  })

  it('incrementerConsultes incrémente le compteur', () => {
    const store = useProfessionalStore()
    store.incrementerConsultes()
    store.incrementerConsultes()
    expect(store.consultes).toBe(2)
  })
})

// ─────────────────────────────────────────────
describe('ProfessionalStore — getters', () => {
  it('totalRecs retourne le nombre de recommandations', () => {
    const store = useProfessionalStore()
    store.recsEmises.push({ candidatId: '1' })
    store.recsEmises.push({ candidatId: '2' })
    expect(store.totalRecs).toBe(2)
  })

  it('candidatsFavoris retourne uniquement les favoris', () => {
    const store = useProfessionalStore()
    store.candidats.push({ id: 'a' }, { id: 'b' })
    store.favoris.push('a')
    expect(store.candidatsFavoris).toHaveLength(1)
    expect(store.candidatsFavoris[0].id).toBe('a')
  })
})
