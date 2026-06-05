import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// ── Mock api uniquement (frontière HTTP) ─────────────────────────────────────
// professorservices N'EST PAS mocké : vrai module utilisé.
vi.mock('@/api', () => ({
  default: {
    get:  vi.fn(),
    post: vi.fn(),
    put:  vi.fn(),
  },
}))

// professorservices importe './api.js' (chemin relatif depuis src/services/)
vi.mock('@/services/api', () => ({
  default: {
    get:  vi.fn(),
    post: vi.fn(),
    put:  vi.fn(),
  },
}))

import api from '@/api'
import { useProfessorStore } from '@/stores/professorStore'

// Données de test — structure attendue par l'API backend
const MOCK_PROJETS = [
  {
    id_projet:         'pj1',
    titre:             'Projet IA',
    type_projet:       'PFA',
    status_validation: 'EN_ATTENTE',
    date_soumission:   '2024-05-01T10:00:00Z',
    description:       'Projet de fin d\'année',
    participations: [
      { etudiant: { id_etudiant: 'e1', utilisateur: { prenom: 'Alice', nom: 'Dupont' }, filiere: 'GINF', score_credibilite: 80 } },
    ],
  },
]

const MOCK_STAGES = [
  {
    id_stage:          's1',
    entreprise:        'TechCorp',
    poste:             'Dev Backend',
    status_validation: 'EN_ATTENTE',
    date_debut:        '2024-06-01',
    date_fin:          '2024-08-31',
    etudiant: { id_etudiant: 'e2', utilisateur: { prenom: 'Bob', nom: 'Martin' }, filiere: 'GIND', score_credibilite: 75 },
  },
]

const MOCK_NOTIFS = [
  { id_notification: 'n1', titre: 'Projet soumis', message: 'Un étudiant a soumis un projet', date_creation: '2024-05-01T10:00:00Z', est_lue: false },
]

// ═════════════════════════════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — professorStore + professorservices (réel) + api (mockée)
// ═════════════════════════════════════════════════════════════════════════════

describe("professorStore + professorservices — Tests d'intégration", () => {

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // ── chargerProjets ─────────────────────────────────────────────────────────

  it('1 — chargerProjets : store → service → api.get /projets/a-valider → projets normalisés', async () => {
    api.get.mockResolvedValue({ data: { data: MOCK_PROJETS } })

    const store = useProfessorStore()
    await store.chargerProjets()

    expect(api.get).toHaveBeenCalledWith('/projets/a-valider')
    expect(store.projets).toHaveLength(1)
    expect(store.projets[0].nom).toBe('Projet IA')
    expect(store.projets[0].status).toBe('pending')
    expect(store.loading.projets).toBe(false)
  })

  it('2 — chargerProjets échoue : erreur stockée dans store.erreur', async () => {
    api.get.mockRejectedValue(new Error('Non autorisé'))

    const store = useProfessorStore()
    await store.chargerProjets()

    expect(store.erreur).toBe('Non autorisé')
    expect(store.loading.projets).toBe(false)
  })

  // ── chargerStages ──────────────────────────────────────────────────────────

  it('3 — chargerStages : store → service → api.get /stages/a-valider → stages normalisés', async () => {
    api.get.mockResolvedValue({ data: { data: MOCK_STAGES } })

    const store = useProfessorStore()
    await store.chargerStages()

    expect(api.get).toHaveBeenCalledWith('/stages/a-valider')
    expect(store.stages).toHaveLength(1)
    expect(store.stages[0].entreprise).toBe('TechCorp')
    expect(store.stages[0].status).toBe('pending')
    expect(store.loading.stages).toBe(false)
  })

  // ── validerProjet ──────────────────────────────────────────────────────────

  it('4 — validerProjet (VALIDE) : store → service → api.post /projets/:id/valider → statut mis à jour localement', async () => {
    api.get.mockResolvedValue({ data: { data: MOCK_PROJETS } })
    api.post.mockResolvedValue({ data: { data: { decision: 'VALIDE' } } })

    const store = useProfessorStore()
    await store.chargerProjets()

    const projet = store.projets[0]
    await store.validerProjet(projet, 'VALIDE', 'Bon travail')

    expect(api.post).toHaveBeenCalledWith('/projets/pj1/valider', {
      decision:    'VALIDE',
      commentaire: 'Bon travail',
      appreciation: '',
    })
    expect(store.projets[0].status).toBe('valide')
    expect(store.projets[0].statusLabel).toBe('Validé')
  })

  it('5 — validerProjet (REJETE) : statut et label mis à jour en rejet', async () => {
    api.get.mockResolvedValue({ data: { data: MOCK_PROJETS } })
    api.post.mockResolvedValue({ data: { data: { decision: 'REJETE' } } })

    const store = useProfessorStore()
    await store.chargerProjets()

    const projet = store.projets[0]
    await store.validerProjet(projet, 'REJETE', 'Travail insuffisant')

    expect(store.projets[0].status).toBe('refus')
    expect(store.projets[0].statusLabel).toBe('Rejeté')
  })

  // ── validerStage ───────────────────────────────────────────────────────────

  it('6 — validerStage (VALIDE) : store → service → api.post /stages/:id/valider → statut mis à jour', async () => {
    api.get.mockResolvedValue({ data: { data: MOCK_STAGES } })
    api.post.mockResolvedValue({ data: { data: { decision: 'VALIDE' } } })

    const store = useProfessorStore()
    await store.chargerStages()

    const stage = store.stages[0]
    await store.validerStage(stage, 'VALIDE', 'Stage validé')

    expect(api.post).toHaveBeenCalledWith('/stages/s1/valider', {
      decision:    'VALIDE',
      commentaire: 'Stage validé',
    })
    expect(store.stages[0].status).toBe('valide')
    expect(store.stages[0].statusLabel).toBe('Validé')
  })

  // ── chargerNotifications ───────────────────────────────────────────────────

  it('7 — chargerNotifications : store → service → api.get /notifications → normalisées', async () => {
    api.get.mockResolvedValue({ data: { data: MOCK_NOTIFS } })

    const store = useProfessorStore()
    await store.chargerNotifications()

    expect(api.get).toHaveBeenCalledWith('/notifications')
    expect(store.notifications).toHaveLength(1)
    expect(store.notifications[0].id).toBe('n1')
    expect(store.notifications[0].color).toBe('#66c99f')
  })

  // ── getters computed ───────────────────────────────────────────────────────

  it('8 — getters computed depuis données api réelles', async () => {
    api.get.mockResolvedValue({ data: { data: MOCK_PROJETS } })

    const store = useProfessorStore()
    await store.chargerProjets()

    expect(store.enAttente).toBe(1)
    expect(store.valides).toBe(0)
    expect(store.etudiantsSuivis).toBe(1)
  })

  // ── workflow complet ───────────────────────────────────────────────────────

  it('9 — workflow : charger projets + stages, puis valider un projet', async () => {
    api.get
      .mockResolvedValueOnce({ data: { data: MOCK_PROJETS } })  // chargerProjets
      .mockResolvedValueOnce({ data: { data: MOCK_STAGES } })   // chargerStages
    api.post.mockResolvedValue({ data: { data: {} } })

    const store = useProfessorStore()
    await store.chargerProjets()
    await store.chargerStages()

    expect(store.projets).toHaveLength(1)
    expect(store.stages).toHaveLength(1)

    await store.validerProjet(store.projets[0], 'VALIDE')

    expect(store.projets[0].status).toBe('valide')
    expect(store.valides).toBe(1)
    expect(store.enAttente).toBe(0)
  })
})
