import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// ── Mock api uniquement (frontière HTTP) ─────────────────────────────────────
// professionalservices N'EST PAS mocké : vrai module utilisé.
vi.mock('@/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

// Note : professionalservices importe './api.js' (chemin relatif).
// On mock le même module résolu par l'alias @/api.
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

import api from '@/api'
import { useProfessionalStore } from '@/stores/professionalStore'

// Données de test — structure attendue par fetchCandidats (via /stages)
const MOCK_STAGES = [
  {
    id_stage: 1,
    etudiant: { id_etudiant: 'e1', filiere: 'GINF', ville: 'Rabat', score_credibilite: 85,
                utilisateur: { prenom: 'Alice', nom: 'Dupont' } },
  },
  {
    id_stage: 2,
    etudiant: { id_etudiant: 'e2', filiere: 'GIND', ville: 'Casablanca', score_credibilite: 70,
                utilisateur: { prenom: 'Bob', nom: 'Martin' } },
  },
  {
    id_stage: 3,
    // Même étudiant e1 — fetchCandidats déduplique
    etudiant: { id_etudiant: 'e1', filiere: 'GINF', ville: 'Rabat', score_credibilite: 85,
                utilisateur: { prenom: 'Alice', nom: 'Dupont' } },
  },
]

const MOCK_NOTIFS = [
  { id_notification: 'n1', titre: 'Nouveau stage', message: 'Un stage a été soumis', date_creation: '2024-05-01T10:00:00Z', est_lue: false },
  { id_notification: 'n2', titre: 'Recommandation', message: 'Une reco a été reçue', date_creation: '2024-04-30T08:00:00Z', est_lue: true },
]

// ═════════════════════════════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — professionalStore + professionalservices (réel) + api (mockée)
// ═════════════════════════════════════════════════════════════════════════════

describe("professionalStore + professionalservices — Tests d'intégration", () => {

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // ── chargerCandidats ───────────────────────────────────────────────────────

  it('1 — chargerCandidats : store → service → api.get /stages → candidats dédupliqués et normalisés', async () => {
    api.get.mockResolvedValue({ data: { data: MOCK_STAGES } })

    const store = useProfessionalStore()
    await store.chargerCandidats()

    expect(api.get).toHaveBeenCalledWith('/stages')
    // 3 stages mais seulement 2 étudiants uniques (e1 apparaît deux fois)
    expect(store.candidats).toHaveLength(2)
    expect(store.candidats[0].id).toBe('e1')
    expect(store.candidats[0].nom).toBe('Alice Dupont')
    expect(store.candidats[1].id).toBe('e2')
    expect(store.loading.candidats).toBe(false)
  })

  it('2 — chargerCandidats avec liste vide : candidats = []', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })

    const store = useProfessionalStore()
    await store.chargerCandidats()

    expect(store.candidats).toEqual([])
  })

  it('3 — chargerCandidats échoue : erreur stockée dans store.erreur', async () => {
    api.get.mockRejectedValue(new Error('Serveur indisponible'))

    const store = useProfessionalStore()
    await store.chargerCandidats()

    expect(store.erreur).toBe('Serveur indisponible')
    expect(store.loading.candidats).toBe(false)
  })

  // ── chargerNotifications ───────────────────────────────────────────────────

  it('4 — chargerNotifications : store → service → api.get /notifications → notifs normalisées', async () => {
    api.get.mockResolvedValue({ data: { data: MOCK_NOTIFS } })

    const store = useProfessionalStore()
    await store.chargerNotifications()

    expect(api.get).toHaveBeenCalledWith('/notifications')
    expect(store.notifications).toHaveLength(2)
    expect(store.notifications[0].id).toBe('n1')
    expect(store.notifications[0].color).toBe('#66c99f')   // non lue → vert
    expect(store.notifications[1].color).toBe('#a0b4ae')   // lue → gris
  })

  // ── envoyerRecommandation ──────────────────────────────────────────────────

  it('5 — envoyerRecommandation : store → service → api.post /recommandations → ajoutée localement', async () => {
    api.get.mockResolvedValue({ data: { data: MOCK_STAGES } })
    api.post.mockResolvedValue({ data: { data: { id_recommandation: 'r1' } } })

    const store = useProfessionalStore()
    await store.chargerCandidats()

    const candidat = store.candidats[0]
    await store.envoyerRecommandation(candidat, 'Très bon étudiant', 'officielle')

    expect(api.post).toHaveBeenCalledWith('/recommandations', {
      id_etudiant: 'e1',
      message:     'Très bon étudiant',
    })
    expect(store.recsEmises).toHaveLength(1)
    expect(store.recsEmises[0].candidatId).toBe('e1')
  })

  // ── workflow complet ───────────────────────────────────────────────────────

  it('6 — workflow : charger candidats + notifs, puis envoyer une reco', async () => {
    api.get
      .mockResolvedValueOnce({ data: { data: MOCK_STAGES } })   // chargerCandidats → /stages
      .mockResolvedValueOnce({ data: { data: MOCK_NOTIFS } })   // chargerNotifications → /notifications
    api.post.mockResolvedValue({ data: { data: {} } })

    const store = useProfessionalStore()
    await store.chargerCandidats()
    await store.chargerNotifications()

    expect(store.candidats).toHaveLength(2)
    expect(store.notifications).toHaveLength(2)

    const candidat = store.candidats[0]
    await store.envoyerRecommandation(candidat, 'Excellent profil', 'officielle')

    expect(store.recsEmises).toHaveLength(1)
  })
})
