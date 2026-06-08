import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/stores/authstore', () => ({
  useAuthStore: vi.fn(() => ({ user: { role: 'PROFESSEUR' } }))
}))

vi.mock('@/services/professorservices.js', () => ({
  fetchProjetsAValider:   vi.fn(),
  validerProjet:          vi.fn(),
  fetchStagesAValider:    vi.fn(),
  validerStage:           vi.fn(),
  fetchNotifications:     vi.fn(),
  marquerNotificationLue: vi.fn(),
}))

import { useProfessorStore, normaliserProjet, normaliserStage, normaliserEtudiant } from '@/stores/professorStore'
import * as svc from '@/services/professorservices.js'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

// ─────────────────────────────────────────────
describe('normaliserProjet', () => {
  it('normalise un projet en attente', () => {
    const p = { id_projet: '1', titre: 'Projet A', status_validation: 'EN_ATTENTE', participations: [] }
    const r = normaliserProjet(p)
    expect(r.id).toBe('1')
    expect(r.nom).toBe('Projet A')
    expect(r.status).toBe('pending')
    expect(r.statusLabel).toBe('En attente')
  })

  it('normalise un projet validé', () => {
    const p = { id_projet: '2', titre: 'Projet B', status_validation: 'VALIDE', participations: [] }
    const r = normaliserProjet(p)
    expect(r.status).toBe('valide')
    expect(r.progress).toBe(100)
  })
})

// ─────────────────────────────────────────────
describe('normaliserStage', () => {
  it('normalise un stage', () => {
    const s = {
      id_stage: '10', entreprise: 'ENSA', poste: 'Dev',
      date_debut: '2024-01-01', date_fin: '2024-06-30',
      status_validation: 'EN_ATTENTE',
      etudiant: { utilisateur: { prenom: 'Jean', nom: 'Paul' } }
    }
    const r = normaliserStage(s)
    expect(r.id).toBe('10')
    expect(r.etudiant).toBe('Jean Paul')
    expect(r.status).toBe('pending')
  })
})

// ─────────────────────────────────────────────
describe('normaliserEtudiant', () => {
  it('normalise un étudiant', () => {
    const e = { id_etudiant: 'e1', filiere: 'Informatique', score_credibilite: 75, utilisateur: { prenom: 'Nour', nom: 'Ben' } }
    const r = normaliserEtudiant(e)
    expect(r.nom).toBe('Nour Ben')
    expect(r.initiales).toBe('NB')
    expect(r.formation).toBe('Informatique')
  })
})

// ─────────────────────────────────────────────
describe('ProfessorStore — chargerProjets', () => {
  it('charge et normalise les projets', async () => {
    svc.fetchProjetsAValider.mockResolvedValue([
      { id_projet: '1', titre: 'Projet Test', status_validation: 'EN_ATTENTE', participations: [] }
    ])
    const store = useProfessorStore()
    await store.chargerProjets()
    expect(store.projets).toHaveLength(1)
    expect(store.projets[0].nom).toBe('Projet Test')
    expect(store.loading.projets).toBe(false)
  })

  it('stocke l\'erreur si l\'API échoue', async () => {
    svc.fetchProjetsAValider.mockRejectedValue(new Error('Erreur réseau'))
    const store = useProfessorStore()
    await store.chargerProjets()
    expect(store.erreur).toBe('Erreur réseau')
  })
})

// ─────────────────────────────────────────────
describe('ProfessorStore — chargerStages', () => {
  it('charge et normalise les stages', async () => {
    svc.fetchStagesAValider.mockResolvedValue([
      { id_stage: '10', entreprise: 'ENSA', poste: 'Dev', date_debut: '2024-01-01', status_validation: 'EN_ATTENTE', etudiant: { utilisateur: { prenom: 'A', nom: 'B' } } }
    ])
    const store = useProfessorStore()
    await store.chargerStages()
    expect(store.stages).toHaveLength(1)
  })
})

// ─────────────────────────────────────────────
describe('ProfessorStore — validerProjet', () => {
  it('met à jour le statut du projet après validation', async () => {
    svc.validerProjet.mockResolvedValue({})
    const store = useProfessorStore()
    store.projets.push({ id: '1', status: 'pending', statusLabel: 'En attente', progress: 50 })
    await store.validerProjet({ id: '1' }, 'VALIDE')
    expect(store.projets[0].status).toBe('valide')
    expect(store.projets[0].statusLabel).toBe('Validé')
    expect(store.projets[0].progress).toBe(100)
  })

  it('met à jour le statut en rejeté', async () => {
    svc.validerProjet.mockResolvedValue({})
    const store = useProfessorStore()
    store.projets.push({ id: '2', status: 'pending', statusLabel: 'En attente', progress: 50 })
    await store.validerProjet({ id: '2' }, 'REJETE')
    expect(store.projets[0].status).toBe('refus')
    expect(store.projets[0].statusLabel).toBe('Rejeté')
  })

  it('relance l\'erreur API si l\'appel échoue', async () => {
    svc.validerProjet.mockRejectedValue(new Error('Erreur API'))
    const store = useProfessorStore()
    store.projets.push({ id: '9', status: 'pending' })
    await expect(store.validerProjet({ id: '9' }, 'VALIDE')).rejects.toThrow('Erreur API')
  })
})

// ─────────────────────────────────────────────
describe('ProfessorStore — validerStage', () => {
  it('met à jour le statut du stage', async () => {
    svc.validerStage.mockResolvedValue({})
    const store = useProfessorStore()
    store.stages.push({ id: '10', status: 'pending' })
    await store.validerStage({ id: '10' }, 'VALIDE')
    expect(store.stages[0].status).toBe('valide')
  })

  it('relance l\'erreur API si l\'appel échoue', async () => {
    svc.validerStage.mockRejectedValue(new Error('Erreur réseau'))
    const store = useProfessorStore()
    store.stages.push({ id: '10', status: 'pending' })
    await expect(store.validerStage({ id: '10' }, 'VALIDE')).rejects.toThrow('Erreur réseau')
  })
})

// ─────────────────────────────────────────────
describe('ProfessorStore — getters', () => {
  it('enAttente compte les projets en attente', () => {
    const store = useProfessorStore()
    store.projets.push({ status: 'pending' }, { status: 'pending' }, { status: 'valide' })
    expect(store.enAttente).toBe(2)
  })

  it('valides compte les projets validés', () => {
    const store = useProfessorStore()
    store.projets.push({ status: 'valide' }, { status: 'pending' })
    expect(store.valides).toBe(1)
  })

  it('stagesEnCours retourne le nombre de stages', () => {
    const store = useProfessorStore()
    store.stages.push({ id: '1' }, { id: '2' })
    expect(store.stagesEnCours).toBe(2)
  })
})
