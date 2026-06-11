import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// ── Mock api uniquement (frontière HTTP) ─────────────────────────────────────
// stageService N'EST PAS mocké : vrai module utilisé.
// authStore est mocké car c'est une dépendance EXTERNE à la chaîne testée.
vi.mock('@/api', () => ({
  default: {
    get:    vi.fn(),
    post:   vi.fn(),
    put:    vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/stores/authstore', () => ({
  useAuthStore: vi.fn(),
}))

import api from '@/api'
import { useAuthStore } from '@/stores/authstore'
import { useStageStore } from '@/stores/stageStore'

const MOCK_USER = { id_utilisateur: 'u1', nom: 'Alice' }

function setupAuthStore(user = MOCK_USER) {
  useAuthStore.mockReturnValue({
    user,
    fetchUser: vi.fn().mockResolvedValue(undefined),
  })
}

// ═════════════════════════════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — stageStore + stageService (réel) + api (mockée)
//
// Principe :
//   - stageStore appelle le VRAI stageService (pas de vi.mock sur le service)
//   - stageService appelle api (mockée à la frontière HTTP)
//   - On teste que la chaîne store → service → api fonctionne de bout en bout
// ═════════════════════════════════════════════════════════════════════════════

describe("stageStore + stageService — Tests d'intégration", () => {

  beforeEach(() => {
    setActivePinia(createPinia())
    setupAuthStore()
    vi.clearAllMocks()
  })

  // ── chargerStages ──────────────────────────────────────────────────────────

  it('1 — chargerStages : store → service → api.get /stages/etudiant/:id → stages mis à jour', async () => {
    const stages = [
      { id_stage: 1, entreprise: 'TechCorp', status_validation: 'VALIDE' },
      { id_stage: 2, entreprise: 'StartupXYZ', status_validation: 'EN_ATTENTE' },
    ]
    api.get.mockResolvedValue({ data: { data: stages } })

    const store = useStageStore()
    await store.chargerStages()

    expect(api.get).toHaveBeenCalledWith('/stages/etudiant/u1')
    expect(store.stages).toEqual(stages)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('2 — chargerStages avec liste vide : stages = []', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })

    const store = useStageStore()
    await store.chargerStages()

    expect(store.stages).toEqual([])
  })

  it('3 — chargerStages échoue : erreur propagée dans store.error', async () => {
    api.get.mockRejectedValue({ response: { data: { message: 'Non autorisé' } } })

    const store = useStageStore()
    await store.chargerStages()

    expect(store.error).toBe('Non autorisé')
    expect(store.stages).toEqual([])
  })

  it('4 — chargerStages sans user : api.get non appelé', async () => {
    setupAuthStore(null)
    const store = useStageStore()
    await store.chargerStages()

    expect(api.get).not.toHaveBeenCalled()
  })

  // ── créer un stage ─────────────────────────────────────────────────────────

  it('5 — sauvegarder (create) : store → service → api.post /stages/etudiant/:id → stage ajouté', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })
    api.post.mockResolvedValue({ data: { data: { id_stage: 10, entreprise: 'AlphaCorp', poste: 'Dev' } } })

    const store = useStageStore()
    await store.chargerStages()

    store.modal.mode      = 'create'
    store.form.entreprise = 'AlphaCorp'
    store.form.poste      = 'Dev'
    store.form.date_debut = '2024-01-01'
    store.form.missions   = 'Développement backend'
    await store.sauvegarder()

    expect(api.post).toHaveBeenCalledWith('/stages/etudiant/u1', expect.objectContaining({
      entreprise: 'AlphaCorp',
      poste:      'Dev',
    }))
    expect(store.stages.some(s => s.entreprise === 'AlphaCorp')).toBe(true)
    expect(store.modal.open).toBe(false)
  })

  it('6 — sauvegarder (create) sans champs obligatoires : api.post non appelé', async () => {
    const store = useStageStore()
    store.modal.mode = 'create'
    await store.sauvegarder()

    expect(api.post).not.toHaveBeenCalled()
    expect(store.toast.type).toBe('error')
  })

  // ── modifier un stage ──────────────────────────────────────────────────────

  it('7 — sauvegarder (edit) : store → service → api.put /stages/:id → stage mis à jour', async () => {
    const initial = [{ id_stage: 5, entreprise: 'OldCorp', poste: 'Dev', status_validation: 'VALIDE' }]
    api.get.mockResolvedValue({ data: { data: initial } })
    api.put.mockResolvedValue({ data: { data: { id_stage: 5, entreprise: 'NewCorp', poste: 'Lead', status_validation: 'VALIDE' } } })

    const store = useStageStore()
    await store.chargerStages()

    store.modal.mode      = 'edit'
    store.modal.stageId   = 5
    store.form.entreprise = 'NewCorp'
    store.form.poste      = 'Lead'
    store.form.date_debut = '2024-01-01'
    store.form.missions   = 'tasks'
    await store.sauvegarder()

    expect(api.put).toHaveBeenCalledWith('/stages/5', expect.objectContaining({
      entreprise: 'NewCorp',
      poste: 'Lead',
    }))
    expect(store.stages[0].entreprise).toBe('NewCorp')
  })

  // ── stats computed ─────────────────────────────────────────────────────────

  it('8 — stats après chargement : computed correct depuis données api réelles', async () => {
    api.get.mockResolvedValue({
      data: {
        data: [
          { id_stage: 1, entreprise: 'A', status_validation: 'VALIDE' },
          { id_stage: 2, entreprise: 'B', status_validation: 'VALIDE' },
          { id_stage: 3, entreprise: 'C', status_validation: 'EN_ATTENTE' },
          { id_stage: 4, entreprise: 'D', status_validation: 'REJETE' },
        ],
      },
    })

    const store = useStageStore()
    await store.chargerStages()

    expect(store.stats.total).toBe(4)
    expect(store.stats.valides).toBe(2)
    expect(store.stats.enAttente).toBe(1)
  })

  // ── scénario complet : charger → créer → modifier ──────────────────────────

  it('9 — workflow complet : charger, créer, puis lire la liste mise à jour', async () => {
    api.get.mockResolvedValue({ data: { data: [{ id_stage: 1, entreprise: 'Existant', status_validation: 'VALIDE' }] } })
    api.post.mockResolvedValue({ data: { data: { id_stage: 99, entreprise: 'Nouveau', poste: 'CTO' } } })

    const store = useStageStore()
    await store.chargerStages()
    expect(store.stages).toHaveLength(1)

    store.modal.mode      = 'create'
    store.form.entreprise = 'Nouveau'
    store.form.poste      = 'CTO'
    store.form.date_debut = '2024-06-01'
    store.form.missions   = 'Lead'
    await store.sauvegarder()

    expect(store.stages).toHaveLength(2)
    expect(store.stages.some(s => s.entreprise === 'Nouveau')).toBe(true)
  })
})
