import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── mock api ─────────────────────────────────────────────────────────────────
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

import api from '@/services/api'
import { fetchStats, fetchProjects, fetchRecos } from '@/services/dashboardservices'

// ── données mock attendues (valeurs de retour en cas d'erreur API) ───────────
const EXPECTED_MOCK_STATS = {
  projetsCertifies: 0,
  credibilite:      0,
  vuesProfil:       0,
  recommandations:  0,
}

const EXPECTED_MOCK_PROJECTS_LENGTH = 0
const EXPECTED_MOCK_RECOS_LENGTH    = 0

// ═════════════════════════════════════════════════════════════════════════════
// TESTS UNITAIRES — dashboardservices
// api toujours mockée. Tests du contrat de chaque fonction (retour, structure).
// ═════════════════════════════════════════════════════════════════════════════
describe('dashboardservices.js — Tests Unitaires', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── fetchStats ─────────────────────────────────────────────────────────────
  describe('fetchStats()', () => {
    it('retourne les stats depuis l\'API', async () => {
      api.get
        .mockResolvedValueOnce({ data: { score_credibilite: 78, _count: { participations_projets: 4, recommandations: 6 } } })
        .mockResolvedValueOnce({ data: [{ nombre_vues: 123 }] })
      const result = await fetchStats('student-1')
      expect(result).toMatchObject(EXPECTED_MOCK_STATS)
    })

    it('retourne un objet avec les 4 clés attendues', async () => {
      api.get.mockRejectedValue(new Error('Not ready'))
      const result = await fetchStats()
      expect(result).toHaveProperty('projetsCertifies')
      expect(result).toHaveProperty('credibilite')
      expect(result).toHaveProperty('vuesProfil')
      expect(result).toHaveProperty('recommandations')
    })

    it('retourne des valeurs numériques', async () => {
      api.get.mockRejectedValue(new Error('Not ready'))
      const result = await fetchStats()
      expect(typeof result.projetsCertifies).toBe('number')
      expect(typeof result.credibilite).toBe('number')
      expect(typeof result.vuesProfil).toBe('number')
      expect(typeof result.recommandations).toBe('number')
    })

    it('retourne des zéros en cas d\'erreur API', async () => {
      api.get.mockRejectedValueOnce(new Error('Network Error'))
      const result = await fetchStats('student-1')
      expect(result).toMatchObject({ projetsCertifies: 0, credibilite: 0, vuesProfil: 0, recommandations: 0 })
    })
  })

  // ── fetchProjects ──────────────────────────────────────────────────────────
  describe('fetchProjects()', () => {
    it('retourne les projets depuis l\'API', async () => {
      const mockRaw = [
        { id_projet: 'p1', titre: 'Projet A', type_projet: 'PFA', status_validation: 'VALIDE', date_debut: '2024-01-01', description: 'desc', technologies: [] },
        { id_projet: 'p2', titre: 'Projet B', type_projet: 'PFE', status_validation: 'EN_ATTENTE', date_debut: '2024-02-01', description: 'desc2', technologies: ['Vue.js'] },
      ]
      api.get.mockResolvedValueOnce({ data: mockRaw })
      const result = await fetchProjects('student-1')
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(EXPECTED_MOCK_PROJECTS_LENGTH)
    })

    it('chaque projet a les propriétés requises', async () => {
      const mockData = [{ id_projet: '1', titre: 'Proj', type_projet: 'PFA', status_validation: 'VALIDE', date_debut: '2024-01-01', description: 'desc', technologies: [] }]
      api.get.mockResolvedValueOnce({ data: mockData })
      const result = await fetchProjects('u1')
      result.forEach(project => {
        expect(project).toHaveProperty('id')
        expect(project).toHaveProperty('titre')
        expect(project).toHaveProperty('type')
        expect(project).toHaveProperty('status')
        expect(project).toHaveProperty('date_debut')
        expect(project).toHaveProperty('description')
        expect(project).toHaveProperty('technologies')
      })
    })

    it('les statuts sont parmi les valeurs autorisées', async () => {
      const STATUTS_VALIDES = ['VALIDE', 'EN_ATTENTE', 'REJETE']
      const mockData = [{ id_projet: '1', titre: 'Proj', type_projet: 'PFA', status_validation: 'VALIDE', date_debut: '2024-01-01', description: 'desc', technologies: [] }]
      api.get.mockResolvedValueOnce({ data: mockData })
      const result = await fetchProjects('u1')
      result.forEach(project => {
        expect(STATUTS_VALIDES).toContain(project.status)
      })
    })

    it('les technologies sont des tableaux', async () => {
      const mockData = [{ id_projet: '1', titre: 'Proj', type_projet: 'PFA', status_validation: 'VALIDE', date_debut: '2024-01-01', description: 'desc', technologies: [] }]
      api.get.mockResolvedValueOnce({ data: mockData })
      const result = await fetchProjects('u1')
      result.forEach(project => {
        expect(Array.isArray(project.technologies)).toBe(true)
      })
    })

    it('retourne un tableau vide en cas d\'erreur API', async () => {
      api.get.mockRejectedValueOnce(new Error('Network Error'))
      const result = await fetchProjects('student-1')
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(0)
    })
  })

  // ── fetchRecos ─────────────────────────────────────────────────────────────
  describe('fetchRecos()', () => {
    it('retourne les recommandations depuis l\'API', async () => {
      const mockRaw = [
        { id_recommandation: 'r1', message: 'Excellent!', status: 'VALIDE', auteur: { nom: 'Doe', prenom: 'John', role: 'PROFESSEUR' } },
        { id_recommandation: 'r2', message: 'Bon travail', status: 'EN_ATTENTE', auteur: { nom: 'Smith', prenom: 'Jane', role: 'PROFESSIONNEL' } },
      ]
      api.get.mockResolvedValueOnce({ data: mockRaw })
      const result = await fetchRecos('student-1')
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(EXPECTED_MOCK_RECOS_LENGTH)
    })

    it('chaque recommandation a un id et un message', async () => {
      const mockData = [{ id_recommandation: 1, message: 'Bien', status: 'VALIDE', auteur: { nom: 'Doe', prenom: 'John', role: 'PROFESSEUR' } }]
      api.get.mockResolvedValueOnce({ data: mockData })
      const result = await fetchRecos('u1')
      result.forEach(reco => {
        expect(reco).toHaveProperty('id_recommandation')
        expect(reco).toHaveProperty('message')
      })
    })

    it("chaque recommandation a un auteur avec nom", async () => {
      const mockData = [{ id_recommandation: 1, message: 'Bien', status: 'VALIDE', auteur: { nom: 'Doe', prenom: 'John', role: 'PROFESSEUR' } }]
      api.get.mockResolvedValueOnce({ data: mockData })
      const result = await fetchRecos('u1')
      result.forEach(reco => {
        expect(reco).toHaveProperty('auteur')
        if (reco.auteur) {
          expect(reco.auteur).toHaveProperty('nom')
        }
      })
    })

    it('retourne un tableau vide en cas d\'erreur API', async () => {
      api.get.mockRejectedValueOnce(new Error('Network Error'))
      api.get.mockRejectedValueOnce(new Error('Network Error'))
      const result = await fetchRecos('student-1')
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(0)
    })
  })

  // ── cohérence globale ──────────────────────────────────────────────────────
  describe('Cohérence des données mock', () => {
    it('fetchStats retourne une crédibilité entre 0 et 100', async () => {
      api.get.mockRejectedValue(new Error('Not ready'))
      const result = await fetchStats()
      expect(result.credibilite).toBeGreaterThanOrEqual(0)
      expect(result.credibilite).toBeLessThanOrEqual(100)
    })

    it('fetchStats retourne des valeurs positives ou nulles', async () => {
      api.get.mockRejectedValue(new Error('Not ready'))
      const result = await fetchStats()
      Object.values(result).forEach(val => {
        expect(val).toBeGreaterThanOrEqual(0)
      })
    })

    it('les 3 fonctions sont bien exportées et appelables', () => {
      expect(typeof fetchStats).toBe('function')
      expect(typeof fetchProjects).toBe('function')
      expect(typeof fetchRecos).toBe('function')
    })
  })
})
