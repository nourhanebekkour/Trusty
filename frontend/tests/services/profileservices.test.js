import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/api', () => ({
  default: {
    get:  vi.fn(),
    put:  vi.fn(),
    post: vi.fn(),
  },
}))

import api from '@/api'
import { getProfile, saveProfile, addSkill } from '@/services/profileservices'

// IDs et email correspondant aux constantes MOCK_ME du service
const EXPECTED_ID    = 'clx123456789abcdefghijk'
const EXPECTED_EMAIL = 'ahmed.benali@etu.uae.ac.ma'

// ─────────────────────────────────────────────────────────────────────────────
describe('profileservices.js', () => {
  beforeEach(() => vi.clearAllMocks())

  // ══════════════════════════════════════════════════════════════════════════
  // getProfile()
  // API_READY=true → api.get retourne undefined → me.id_utilisateur throws
  //                → catch → retourne le fallback mock
  // ══════════════════════════════════════════════════════════════════════════
  describe('getProfile()', () => {
    it('retourne un objet { data }', async () => {
      const result = await getProfile()
      expect(result).toHaveProperty('data')
    })

    it('data contient les champs utilisateur de base', async () => {
      const { data } = await getProfile()
      expect(data.id_utilisateur).toBe(EXPECTED_ID)
      expect(data.email).toBe(EXPECTED_EMAIL)
      expect(data.nom).toBe('Benali')
      expect(data.prenom).toBe('Ahmed')
      expect(data.role).toBe('ETUDIANT')
    })

    it('data.etudiant existe et est un objet', async () => {
      const { data } = await getProfile()
      expect(data.etudiant).toBeTruthy()
    })

    it('data.etudiant.competences a 2 items avec Vue.js en premier', async () => {
      const { data } = await getProfile()
      expect(data.etudiant.competences).toHaveLength(2)
      expect(data.etudiant.competences[0].competence.nom).toBe('Vue.js')
    })

    it('data.etudiant.badges a 1 item', async () => {
      const { data } = await getProfile()
      expect(data.etudiant.badges).toHaveLength(1)
      expect(data.etudiant.badges[0].badge.nom).toBe('Projet Excellence')
    })

    it('data.etudiant.participations_projets a 2 items', async () => {
      const { data } = await getProfile()
      expect(data.etudiant.participations_projets).toHaveLength(2)
      expect(data.etudiant.participations_projets[0].projet.status_validation).toBe('VALIDE')
    })

    it('data.etudiant.depots_github est un tableau', async () => {
      const { data } = await getProfile()
      expect(Array.isArray(data.etudiant.depots_github)).toBe(true)
    })

    it('retourne toujours une promesse résolue (jamais rejetée)', async () => {
      await expect(getProfile()).resolves.toBeDefined()
    })

    it('utilise les données API quand api.get réussit', async () => {
      const apiMe = {
        id_utilisateur: 'api-id', email: 'api@test.com',
        nom: 'ApiNom', prenom: 'ApiPrenom', role: 'ETUDIANT',
        telephone: null, photo: null,
      }
      const apiEtudiant = { id_etudiant: 'api-id', filiere: 'GINF', ville: 'Rabat', pays: 'Maroc' }
      api.get
        .mockResolvedValueOnce({ data: { data: apiMe } })
        .mockResolvedValueOnce({ data: { data: apiEtudiant } })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { data: [] } })
      const { data } = await getProfile()
      expect(data.id_utilisateur).toBe('api-id')
      expect(data.email).toBe('api@test.com')
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // saveProfile()
  // API_READY=true, api.put→undefined + api.get×3→undefined
  //   → assembleUser(undefined,…) throws → catch → fallback MOCK_ME+MOCK_ETUDIANT
  // ══════════════════════════════════════════════════════════════════════════
  describe('saveProfile()', () => {
    it('retourne { data } même si l\'API échoue', async () => {
      const result = await saveProfile(EXPECTED_ID, { prenom: 'Omar', nom: 'Benali', filiere: 'GINF' })
      expect(result).toHaveProperty('data')
    })

    it('data contient id_utilisateur et etudiant', async () => {
      const { data } = await saveProfile(EXPECTED_ID, { prenom: 'Test', nom: 'Test', filiere: 'GINF' })
      expect(data).toHaveProperty('id_utilisateur')
      expect(data).toHaveProperty('etudiant')
    })

    it('retourne toujours une promesse résolue', async () => {
      await expect(
        saveProfile(EXPECTED_ID, { prenom: 'X', nom: 'Y', filiere: 'GINF' })
      ).resolves.toBeDefined()
    })

    it('utilise les données API si PUT + GET réussissent', async () => {
      const apiEtudiant = { id_etudiant: EXPECTED_ID, filiere: 'GINF', ville: 'Rabat' }
      const apiMe       = {
        id_utilisateur: EXPECTED_ID, email: EXPECTED_EMAIL,
        nom: 'Benali', prenom: 'Omar', role: 'ETUDIANT', telephone: null, photo: null,
      }
      const apiCompetences = [
        { competence: { id_competence: 'c1', nom: 'Vue.js', type: 'TECHNIQUE' }, niveau_maitrise: 'INTERMEDIAIRE' },
      ]
      api.put.mockResolvedValueOnce({ data: { data: apiEtudiant } })
      api.get
        .mockResolvedValueOnce({ data: { data: apiMe } })
        .mockResolvedValueOnce({ data: { data: apiCompetences } })
        .mockResolvedValueOnce({ data: { badges: [] } })
      const { data } = await saveProfile(EXPECTED_ID, { prenom: 'Omar', nom: 'Benali', filiere: 'GINF' })
      expect(data.prenom).toBe('Omar')
      expect(data.etudiant.competences).toHaveLength(1)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // addSkill()
  // API_READY=true → appelle api.post × 2 (catalog + association)
  // ══════════════════════════════════════════════════════════════════════════
  describe('addSkill()', () => {
    const catalogRes = (nom) => ({
      data: { data: { id_competence: `comp-${nom}`, nom, type: 'TECHNIQUE' } },
    })
    const assocRes = (niveau = 'DEBUTANT') => ({
      data: { data: { niveau_maitrise: niveau } },
    })

    it('retourne { data: { competence, niveau_maitrise } }', async () => {
      api.post.mockResolvedValueOnce(catalogRes('Docker'))
      api.post.mockResolvedValueOnce(assocRes())
      const { data } = await addSkill(EXPECTED_ID, 'Docker')
      expect(data.competence.nom).toBe('Docker')
      expect(data.competence.id_competence).toBeTruthy()
      expect(data.niveau_maitrise).toBe('DEBUTANT')
    })

    it('appelle POST /competences avec le bon nom', async () => {
      api.post.mockResolvedValueOnce(catalogRes('Kubernetes'))
      api.post.mockResolvedValueOnce(assocRes())
      await addSkill(EXPECTED_ID, 'Kubernetes')
      expect(api.post).toHaveBeenCalledWith('/competences', { nom: 'Kubernetes', type: 'TECHNIQUE' })
    })

    it('appelle POST /competences/etudiant/:id/:compId pour l\'association', async () => {
      const compId = 'comp-react'
      api.post.mockResolvedValueOnce({ data: { data: { id_competence: compId, nom: 'React', type: 'TECHNIQUE' } } })
      api.post.mockResolvedValueOnce(assocRes())
      await addSkill(EXPECTED_ID, 'React')
      expect(api.post).toHaveBeenCalledWith(
        `/competences/etudiant/${EXPECTED_ID}/${compId}`,
        { niveau_maitrise: 'DEBUTANT' }
      )
    })

    it('utilise le niveau_maitrise fourni en paramètre', async () => {
      api.post.mockResolvedValueOnce(catalogRes('TypeScript'))
      api.post.mockResolvedValueOnce(assocRes('AVANCE'))
      const { data } = await addSkill(EXPECTED_ID, 'TypeScript', 'AVANCE')
      expect(data.niveau_maitrise).toBe('AVANCE')
    })

    it('propage l\'erreur si api.post échoue', async () => {
      api.post.mockRejectedValueOnce(new Error('Network error'))
      await expect(addSkill(EXPECTED_ID, 'Docker')).rejects.toThrow('Network error')
    })

    it('fonctionne avec des noms de compétences variés', async () => {
      for (const nom of ['Machine Learning', 'PHP', 'Laravel']) {
        api.post.mockResolvedValueOnce(catalogRes(nom))
        api.post.mockResolvedValueOnce(assocRes())
        const { data } = await addSkill(EXPECTED_ID, nom)
        expect(data.competence.nom).toBe(nom)
      }
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // Contrats d'interface
  // ══════════════════════════════════════════════════════════════════════════
  describe('Contrats d\'interface', () => {
    it('getProfile — data contient tous les champs attendus', async () => {
      const { data } = await getProfile()
      ;['id_utilisateur', 'email', 'nom', 'prenom', 'role', 'date_creation', 'etudiant']
        .forEach(c => expect(data).toHaveProperty(c))
    })

    it('getProfile — data.etudiant contient les sous-collections', async () => {
      const { data } = await getProfile()
      ;['competences', 'badges', 'participations_projets', 'depots_github']
        .forEach(c => expect(data.etudiant).toHaveProperty(c))
    })

    it('saveProfile — data contient etudiant', async () => {
      const { data } = await saveProfile(EXPECTED_ID, { prenom: 'T', nom: 'T', filiere: 'GINF' })
      expect(data).toHaveProperty('etudiant')
    })
  })
})
