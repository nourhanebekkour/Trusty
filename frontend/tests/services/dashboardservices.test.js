import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── mock api ─────────────────────────────────────────────────────────────────
vi.mock('@/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

import api from '@/api'
import { fetchStats, fetchProjects, fetchRecos } from '@/services/dashboardservices'

// ── données mock attendues (identiques au service) ───────────────────────────
const EXPECTED_MOCK_STATS = {
  projetsCertifies: 4,
  credibilite:      78,
  vuesProfil:       123,
  recommandations:  6,
}

const EXPECTED_MOCK_PROJECTS_LENGTH = 2
const EXPECTED_MOCK_RECOS_LENGTH    = 2

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
    it('retourne les données mock quand API_READY est false', async () => {
      const result = await fetchStats()
      expect(result).toMatchObject(EXPECTED_MOCK_STATS)
    })

    it('retourne un objet avec les 4 clés attendues', async () => {
      const result = await fetchStats()
      expect(result).toHaveProperty('projetsCertifies')
      expect(result).toHaveProperty('credibilite')
      expect(result).toHaveProperty('vuesProfil')
      expect(result).toHaveProperty('recommandations')
    })

    it('retourne des valeurs numériques', async () => {
      const result = await fetchStats()
      expect(typeof result.projetsCertifies).toBe('number')
      expect(typeof result.credibilite).toBe('number')
      expect(typeof result.vuesProfil).toBe('number')
      expect(typeof result.recommandations).toBe('number')
    })

    it('retourne les données mock en cas d\'erreur API', async () => {
      api.get.mockRejectedValueOnce(new Error('Network Error'))
      const result = await fetchStats()
      expect(result).toMatchObject(EXPECTED_MOCK_STATS)
    })
  })

  // ── fetchProjects ──────────────────────────────────────────────────────────
  describe('fetchProjects()', () => {
    it('retourne un tableau de projets mock quand API_READY est false', async () => {
      const result = await fetchProjects()
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(EXPECTED_MOCK_PROJECTS_LENGTH)
    })

    it('chaque projet a les propriétés requises', async () => {
      const result = await fetchProjects()
      result.forEach(project => {
        expect(project).toHaveProperty('id_projet')
        expect(project).toHaveProperty('titre')
        expect(project).toHaveProperty('type_projet')
        expect(project).toHaveProperty('status_validation')
        expect(project).toHaveProperty('date_debut')
        expect(project).toHaveProperty('description')
        expect(project).toHaveProperty('technologies')
      })
    })

    it('les statuts sont parmi les valeurs autorisées', async () => {
      const STATUTS_VALIDES = ['VALIDE', 'EN_ATTENTE', 'REJETE']
      const result = await fetchProjects()
      result.forEach(project => {
        expect(STATUTS_VALIDES).toContain(project.status_validation)
      })
    })

    it('les technologies sont des tableaux', async () => {
      const result = await fetchProjects()
      result.forEach(project => {
        expect(Array.isArray(project.technologies)).toBe(true)
      })
    })

    it('retourne les données mock en cas d\'erreur API', async () => {
      api.get.mockRejectedValueOnce(new Error('Network Error'))
      const result = await fetchProjects()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  // ── fetchRecos ─────────────────────────────────────────────────────────────
  describe('fetchRecos()', () => {
    it('retourne un tableau de recommandations mock quand API_READY est false', async () => {
      const result = await fetchRecos()
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(EXPECTED_MOCK_RECOS_LENGTH)
    })

    it('chaque recommandation a un id et un message', async () => {
      const result = await fetchRecos()
      result.forEach(reco => {
        expect(reco).toHaveProperty('id_recommandation')
        expect(reco).toHaveProperty('message')
      })
    })

    it("chaque recommandation a un auteur avec nom", async () => {
      const result = await fetchRecos()
      result.forEach(reco => {
        expect(reco).toHaveProperty('auteur')
        expect(reco.auteur).toHaveProperty('nom')
      })
    })

    it('retourne les données mock en cas d\'erreur API', async () => {
      api.get.mockRejectedValueOnce(new Error('Network Error'))
      const result = await fetchRecos()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  // ── cohérence globale ──────────────────────────────────────────────────────
  describe('Cohérence des données mock', () => {
    it('fetchStats retourne une crédibilité entre 0 et 100', async () => {
      const result = await fetchStats()
      expect(result.credibilite).toBeGreaterThanOrEqual(0)
      expect(result.credibilite).toBeLessThanOrEqual(100)
    })

    it('fetchStats retourne des valeurs positives ou nulles', async () => {
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
