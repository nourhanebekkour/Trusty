import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── mock api ─────────────────────────────────────────────────────────────────
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

import api from '@/services/api'
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

// ─────────────────────────────────────────────────────────────────────────────
describe('dashboardservices.js', () => {

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
      // Même en mode API_READY=false, le fallback est assuré
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
        expect(project).toHaveProperty('id')
        expect(project).toHaveProperty('titre')
        expect(project).toHaveProperty('type')
        expect(project).toHaveProperty('statut')
        expect(project).toHaveProperty('dateDebut')
        expect(project).toHaveProperty('description')
        expect(project).toHaveProperty('tags')
      })
    })

    it('les statuts sont parmi les valeurs autorisées', async () => {
      const STATUTS_VALIDES = ['Certifié', 'En cours', 'En attente']
      const result = await fetchProjects()
      result.forEach(project => {
        expect(STATUTS_VALIDES).toContain(project.statut)
      })
    })

    it('les tags sont des tableaux', async () => {
      const result = await fetchProjects()
      result.forEach(project => {
        expect(Array.isArray(project.tags)).toBe(true)
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

    it('chaque recommandation a un id et un contenu/message', async () => {
      const result = await fetchRecos()
      result.forEach(reco => {
        expect(reco).toHaveProperty('id')
        // le service mock utilise "contenu", le composant utilise "message"
        const hasContent = 'contenu' in reco || 'message' in reco
        expect(hasContent).toBe(true)
      })
    })

    it("chaque recommandation a un auteur avec nom et poste", async () => {
      const result = await fetchRecos()
      result.forEach(reco => {
        expect(reco).toHaveProperty('auteur')
        expect(reco.auteur).toHaveProperty('nom')
        expect(reco.auteur).toHaveProperty('poste')
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