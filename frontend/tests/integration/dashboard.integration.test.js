import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/api', () => ({
  default: {
    get:  vi.fn(),
    post: vi.fn(),
    interceptors: { response: { use: vi.fn() } },
  }
}))

import api from '@/services/api'
import {
  fetchStats,
  fetchProjects,
  fetchRecos,
  getAuteurLabel,
} from '@/services/dashboardservices'

beforeEach(() => vi.clearAllMocks())

// ─────────────────────────────────────────────
describe('dashboardServices — fetchStats', () => {

  it('1 — retourne les stats depuis l\'API si la réponse n\'est pas vide', async () => {
    api.get.mockResolvedValue({ data: { data: {
      score_credibilite: 88,
      _count: { participations_projets: 5, recommendation: 3 },
      portfolio: { nombre_vues: 120 }
    }}})

    const result = await fetchStats('u1')

    expect(api.get).toHaveBeenCalledWith('/etudiants/u1')
    expect(result.credibilite).toBe(88)
    expect(result.projetsCertifies).toBe(5)
    expect(result.recommandations).toBe(3)
    expect(result.vuesProfil).toBe(120)
  })

  it('2 — retourne les stats démo si la réponse est vide', async () => {
    api.get.mockResolvedValue({ data: { data: {} } })

    const result = await fetchStats('u1')

    expect(result).toBeDefined()
    expect(typeof result.credibilite).toBe('number')
  })

  it('3 — retourne les stats démo si l\'API échoue', async () => {
    api.get.mockRejectedValue(new Error('Erreur réseau'))

    const result = await fetchStats('u1')

    expect(result).toBeDefined()
    expect(typeof result.credibilite).toBe('number')
  })
})

// ─────────────────────────────────────────────
describe('dashboardServices — fetchProjects', () => {

  it('4 — retourne les projets filtrés par étudiant', async () => {
    api.get.mockResolvedValue({ data: { data: [
      {
        id_projet: '1', titre: 'Projet A',
        participations: [{ id_etudiant: 'u1', est_visible_portfolio: true, est_createur: true, role_joue: 'dev' }]
      },
      {
        id_projet: '2', titre: 'Projet B',
        participations: [{ id_etudiant: 'u2', est_visible_portfolio: true }]
      },
    ]}})

    const result = await fetchProjects('u1')

    expect(result).toHaveLength(1)
    expect(result[0].titre).toBe('Projet A')
    expect(result[0].est_createur).toBe(true)
  })

  it('5 — retourne les données démo si aucun projet', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })

    const result = await fetchProjects('u1')

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0) // données démo
  })

  it('6 — retourne les données démo si l\'API échoue', async () => {
    api.get.mockRejectedValue(new Error('Erreur API'))

    const result = await fetchProjects('u1')

    expect(Array.isArray(result)).toBe(true)
  })
})

// ─────────────────────────────────────────────
describe('dashboardServices — fetchRecos', () => {

  it('7 — retourne les recommandations normalisées', async () => {
    api.get.mockResolvedValue({ data: { data: [
      {
        id_recommandation: 1,
        message: 'Excellent travail',
        status: 'VALIDE',
        auteur: { prenom: 'Prof', nom: 'Martin', role: 'PROFESSEUR',
                  professeur: { specialite: 'Info', departement: 'SI' } }
      }
    ]}})

    const result = await fetchRecos('u1')

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('8 — retourne tableau vide ou données démo si l\'API échoue', async () => {
    api.get.mockRejectedValue(new Error('Erreur'))

    const result = await fetchRecos('u1')

    expect(Array.isArray(result)).toBe(true)
  })
})

// ─────────────────────────────────────────────
describe('getAuteurLabel', () => {

  it('9 — PROFESSEUR : retourne specialite · departement', () => {
    expect(getAuteurLabel({ role: 'PROFESSEUR', specialite: 'Informatique', departement: 'SI' }))
      .toBe('Informatique · SI')
  })

  it('10 — PROFESSIONNEL : retourne poste · entreprise', () => {
    expect(getAuteurLabel({ role: 'PROFESSIONNEL', poste: 'Dev', entreprise: 'ENSA' }))
      .toBe('Dev · ENSA')
  })

  it('11 — ETUDIANT : retourne filiere · Année X', () => {
    expect(getAuteurLabel({ role: 'ETUDIANT', filiere: 'Informatique', annee: 3 }))
      .toBe('Informatique · Année 3')
  })

  it('12 — auteur null/undefined : retourne chaîne vide', () => {
    expect(getAuteurLabel(null)).toBe('')
    expect(getAuteurLabel(undefined)).toBe('')
  })

  it('13 — champs imbriqués professeur.specialite : correctement extraits', () => {
    expect(getAuteurLabel({
      role: 'PROFESSEUR',
      professeur: { specialite: 'Maths', departement: 'Sciences' }
    })).toBe('Maths · Sciences')
  })
})
