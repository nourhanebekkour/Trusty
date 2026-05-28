import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/stageService', () => ({
  fetchStagesEtudiant: vi.fn(),
  creerStage:          vi.fn(),
  modifierStage:       vi.fn(),
  supprimerStage:      vi.fn(),
}))

vi.mock('@/stores/authstore', () => ({
  useAuthStore: vi.fn(),
}))

import {
  fetchStagesEtudiant,
  creerStage,
  modifierStage,
} from '@/services/stageService'
import { useAuthStore } from '@/stores/authstore'
import {
  useStageStore,
  initiales,
  logoColor,
  avatarColor,
  formatDate,
  badgeClass,
  labelStatut,
  formDefault,
} from '@/stores/stageStore'

const MOCK_USER = { id_utilisateur: 'u1', nom: 'Alice' }

function makeAuthStore(user = MOCK_USER) {
  useAuthStore.mockReturnValue({
    user,
    fetchUser: vi.fn().mockResolvedValue(undefined),
  })
}

// ═════════════════════════════════════════════════════════════
// TESTS UNITAIRES — helpers exportés
// ═════════════════════════════════════════════════════════════

describe('stageStore — Helpers (unitaires)', () => {

  it('1 — initiales retourne les 2 premières initiales en majuscule', () => {
    expect(initiales('Tech Corp')).toBe('TC')
  })

  it('2 — initiales retourne "?" si la chaine est vide', () => {
    expect(initiales('')).toBe('?')
    expect(initiales(null)).toBe('?')
  })

  it('3 — logoColor retourne une chaîne CSS gradient', () => {
    expect(logoColor('TechCorp')).toContain('linear-gradient')
  })

  it('4 — avatarColor retourne une couleur hex', () => {
    expect(avatarColor('Alice')).toMatch(/^#/)
  })

  it('5 — formatDate retourne "—" si la date est vide', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate('')).toBe('—')
  })

  it('6 — formatDate retourne une date formatée en fr-FR', () => {
    const result = formatDate('2024-06-15')
    expect(result).toContain('2024')
  })

  it('7 — badgeClass retourne badge--valide pour VALIDE', () => {
    expect(badgeClass('VALIDE')).toBe('badge--valide')
  })

  it('8 — badgeClass retourne badge--attente pour EN_ATTENTE', () => {
    expect(badgeClass('EN_ATTENTE')).toBe('badge--attente')
  })

  it('9 — badgeClass retourne badge--rejete pour REJETE', () => {
    expect(badgeClass('REJETE')).toBe('badge--rejete')
  })

  it('10 — badgeClass retourne badge--cours pour statut inconnu', () => {
    expect(badgeClass('AUTRE')).toBe('badge--cours')
  })

  it('11 — labelStatut retourne le label français correct', () => {
    expect(labelStatut('VALIDE')).toBe('Validé')
    expect(labelStatut('EN_ATTENTE')).toBe('En attente')
    expect(labelStatut('REJETE')).toBe('Rejeté')
  })

  it('12 — labelStatut retourne le statut brut si inconnu', () => {
    expect(labelStatut('INCONNU')).toBe('INCONNU')
  })

  it('13 — formDefault retourne un objet avec est_public à true', () => {
    const f = formDefault()
    expect(f.est_public).toBe(true)
    expect(f.entreprise).toBe('')
    expect(f.poste).toBe('')
  })
})

// ═════════════════════════════════════════════════════════════
// TESTS UNITAIRES — store
// ═════════════════════════════════════════════════════════════

describe('stageStore — Tests Unitaires', () => {

  beforeEach(() => {
    setActivePinia(createPinia())
    makeAuthStore()
    vi.clearAllMocks()
  })

  // ── État initial ────────────────────────────────────────────

  it('14 — état initial : stages vide, loading false, error null', () => {
    const store = useStageStore()
    expect(store.stages).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.saving).toBe(false)
  })

  it('15 — stats initial : total 0, valides 0, enAttente 0', () => {
    const store = useStageStore()
    expect(store.stats.total).toBe(0)
    expect(store.stats.valides).toBe(0)
    expect(store.stats.enAttente).toBe(0)
  })

  // ── chargerStages ───────────────────────────────────────────

  it('16 — chargerStages appelle fetchStagesEtudiant avec l\'id user', async () => {
    fetchStagesEtudiant.mockResolvedValue([])
    const store = useStageStore()
    await store.chargerStages()
    expect(fetchStagesEtudiant).toHaveBeenCalledWith('u1')
  })

  it('17 — chargerStages met à jour stages après succès', async () => {
    const data = [{ id_stage: 1, entreprise: 'TechCorp', status_validation: 'VALIDE' }]
    fetchStagesEtudiant.mockResolvedValue(data)
    const store = useStageStore()
    await store.chargerStages()
    expect(store.stages).toEqual(data)
  })

  it('18 — chargerStages met error en cas d\'échec API', async () => {
    fetchStagesEtudiant.mockRejectedValue({ response: { data: { message: 'Erreur serveur' } } })
    const store = useStageStore()
    await store.chargerStages()
    expect(store.error).toBe('Erreur serveur')
  })

  it('19 — chargerStages ne fait rien si idEtudiant est null', async () => {
    makeAuthStore(null)
    const store = useStageStore()
    await store.chargerStages()
    expect(fetchStagesEtudiant).not.toHaveBeenCalled()
  })

  // ── stats computed ──────────────────────────────────────────

  it('20 — stats.valides compte les stages VALIDE', async () => {
    fetchStagesEtudiant.mockResolvedValue([
      { id_stage: 1, entreprise: 'A', status_validation: 'VALIDE' },
      { id_stage: 2, entreprise: 'B', status_validation: 'EN_ATTENTE' },
      { id_stage: 3, entreprise: 'C', status_validation: 'VALIDE' },
    ])
    const store = useStageStore()
    await store.chargerStages()
    expect(store.stats.valides).toBe(2)
    expect(store.stats.enAttente).toBe(1)
    expect(store.stats.total).toBe(3)
  })

  // ── openModal ───────────────────────────────────────────────

  it('21 — openModal(create) ouvre le modal en mode create avec formulaire vide', () => {
    const store = useStageStore()
    store.openModal('create')
    expect(store.modal.open).toBe(true)
    expect(store.modal.mode).toBe('create')
    expect(store.form.entreprise).toBe('')
  })

  it('22 — openModal(edit, stage) pré-remplit le formulaire avec les données du stage', () => {
    const stage = { id_stage: 5, entreprise: 'TechCorp', poste: 'Dev', date_debut: '2024-01-01', missions: 'Test' }
    const store = useStageStore()
    store.openModal('edit', stage)
    expect(store.modal.mode).toBe('edit')
    expect(store.modal.stageId).toBe(5)
    expect(store.form.entreprise).toBe('TechCorp')
    expect(store.form.poste).toBe('Dev')
  })

  // ── sauvegarder ─────────────────────────────────────────────

  it('23 — sauvegarder en mode create appelle creerStage', async () => {
    creerStage.mockResolvedValue({ id_stage: 99, entreprise: 'NewCo', poste: 'Dev' })
    const store = useStageStore()
    store.modal.mode = 'create'
    store.form.entreprise  = 'NewCo'
    store.form.poste       = 'Dev'
    store.form.date_debut  = '2024-01-01'
    store.form.missions    = 'Dev tasks'
    await store.sauvegarder()
    expect(creerStage).toHaveBeenCalled()
  })

  it('24 — sauvegarder sans champs obligatoires affiche une erreur toast', async () => {
    const store = useStageStore()
    store.modal.mode = 'create'
    await store.sauvegarder()
    expect(store.toast.show).toBe(true)
    expect(store.toast.type).toBe('error')
    expect(creerStage).not.toHaveBeenCalled()
  })

  it('25 — sauvegarder en mode edit appelle modifierStage', async () => {
    modifierStage.mockResolvedValue({ id_stage: 5, entreprise: 'Updated' })
    const store = useStageStore()
    store.modal.mode    = 'edit'
    store.modal.stageId = 5
    store.form.entreprise = 'Updated'
    store.form.poste      = 'Dev'
    store.form.date_debut = '2024-01-01'
    store.form.missions   = 'tasks'
    await store.sauvegarder()
    expect(modifierStage).toHaveBeenCalledWith(5, expect.any(Object))
  })

  // ── filtres & pagination ────────────────────────────────────

  it('26 — filterStatut filtre les stages par statut', async () => {
    fetchStagesEtudiant.mockResolvedValue([
      { id_stage: 1, entreprise: 'A', status_validation: 'VALIDE' },
      { id_stage: 2, entreprise: 'B', status_validation: 'EN_ATTENTE' },
    ])
    const store = useStageStore()
    await store.chargerStages()
    store.filterStatut = 'VALIDE'
    expect(store.stagesFiltres.length).toBe(1)
    expect(store.stagesFiltres[0].entreprise).toBe('A')
  })

  it('27 — filterSearch filtre les stages par nom d\'entreprise', async () => {
    fetchStagesEtudiant.mockResolvedValue([
      { id_stage: 1, entreprise: 'TechCorp', status_validation: 'VALIDE' },
      { id_stage: 2, entreprise: 'StartupXYZ', status_validation: 'EN_ATTENTE' },
    ])
    const store = useStageStore()
    await store.chargerStages()
    store.filterSearch = 'tech'
    expect(store.stagesFiltres.length).toBe(1)
    expect(store.stagesFiltres[0].entreprise).toBe('TechCorp')
  })
})

// ═════════════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — store
// ═════════════════════════════════════════════════════════════

describe("stageStore — Tests d'Intégration", () => {

  beforeEach(() => {
    setActivePinia(createPinia())
    makeAuthStore()
    vi.clearAllMocks()
  })

  it('28 — charger puis créer : le nouveau stage apparaît dans stages', async () => {
    fetchStagesEtudiant.mockResolvedValue([])
    creerStage.mockResolvedValue({ id_stage: 10, entreprise: 'AlphaCorp', poste: 'Dev' })
    const store = useStageStore()
    await store.chargerStages()

    store.modal.mode      = 'create'
    store.form.entreprise = 'AlphaCorp'
    store.form.poste      = 'Dev'
    store.form.date_debut = '2024-01-01'
    store.form.missions   = 'Dev tasks'
    await store.sauvegarder()

    expect(store.stages.some(s => s.entreprise === 'AlphaCorp')).toBe(true)
  })

  it('29 — charger puis modifier : le stage est mis à jour dans la liste', async () => {
    fetchStagesEtudiant.mockResolvedValue([{ id_stage: 5, entreprise: 'OldCorp', poste: 'Dev', status_validation: 'VALIDE' }])
    modifierStage.mockResolvedValue({ id_stage: 5, entreprise: 'NewCorp', poste: 'Lead', status_validation: 'VALIDE' })
    const store = useStageStore()
    await store.chargerStages()

    store.modal.mode      = 'edit'
    store.modal.stageId   = 5
    store.form.entreprise = 'NewCorp'
    store.form.poste      = 'Lead'
    store.form.date_debut = '2024-01-01'
    store.form.missions   = 'tasks'
    await store.sauvegarder()

    expect(store.stages[0].entreprise).toBe('NewCorp')
  })

  it('30 — showToast : le toast disparaît après 3.2s', async () => {
    vi.useFakeTimers()
    const store = useStageStore()
    store.showToast('Test message')
    expect(store.toast.show).toBe(true)
    vi.advanceTimersByTime(3200)
    expect(store.toast.show).toBe(false)
    vi.useRealTimers()
  })
})
