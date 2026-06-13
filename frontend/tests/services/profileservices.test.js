import { describe, it, expect, vi, beforeEach } from 'vitest'

// profileservices.js importe '@/services/api'
vi.mock('@/services/api', () => ({
  default: {
    get:  vi.fn(),
    put:  vi.fn(),
    post: vi.fn(),
  },
}))

import api from '@/services/api'

// fetchGithubRepos utilise fetch global — on stub pour éviter les appels réseau
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok:   true,
  json: vi.fn().mockResolvedValue([]),
}))

import api from '@/services/api'
import { getProfile, saveProfile, addSkill } from '@/services/profileservices'

const EXPECTED_ID    = 'clx123456789abcdefghijk'
const EXPECTED_EMAIL = 'ahmed.benali@etu.uae.ac.ma'

// ── Données mock utilisées dans les mocks api ──────────────────────────────
const MOCK_ME = {
  id_utilisateur: EXPECTED_ID,
  email:          EXPECTED_EMAIL,
  nom:            'Benali',
  prenom:         'Ahmed',
  role:           'ETUDIANT',
  telephone:      null,
  photo:          null,
  date_creation:  '2022-09-01T00:00:00Z',
}

const MOCK_ETUDIANT = {
  id_etudiant: EXPECTED_ID,
  filiere:     'GINF',
  ville:       'Rabat',
  pays:        'Maroc',
}

const MOCK_COMPETENCES = [
  { competence: { id_competence: 'c1', nom: 'Vue.js', type: 'TECHNIQUE' }, niveau_maitrise: 'INTERMEDIAIRE' },
  { competence: { id_competence: 'c2', nom: 'PHP',    type: 'TECHNIQUE' }, niveau_maitrise: 'DEBUTANT' },
]

const MOCK_BADGES = [
  { badge: { id_badge: 'b1', nom: 'Projet Excellence' }, date_attribution: '2024-01-01' },
]

const MOCK_PROJETS = [
  { projet: { id_projet: 'p1', status_validation: 'VALIDE' } },
  { projet: { id_projet: 'p2', status_validation: 'EN_ATTENTE' } },
]

// ── Helper : setup des mocks api.get pour getProfile() ───────────────────
// getProfile() fait 5 appels api.get dans l'ordre :
// 1. /auth/me, 2. /etudiants/:id, 3. /competences/etudiant/:id,
// 4. /badges/etudiant/:id, 5. /projets/etudiant/:id
const setupGetProfileMocks = () => {
  api.get
    .mockResolvedValueOnce({ data: { data: MOCK_ME } })
    .mockResolvedValueOnce({ data: { data: MOCK_ETUDIANT } })
    .mockResolvedValueOnce({ data: { data: MOCK_COMPETENCES } })
    .mockResolvedValueOnce({ data: { data: MOCK_BADGES } })
    .mockResolvedValueOnce({ data: { data: MOCK_PROJETS } })
}



// ═════════════════════════════════════════════════════════════════════════════
// TESTS UNITAIRES — profileservices
// api toujours mockée. Tests du contrat de chaque fonction (retour, structure).
// ═════════════════════════════════════════════════════════════════════════════
describe('profileservices.js — Tests Unitaires', () => {

  beforeEach(() => {
    vi.resetAllMocks()
  })

  // ── getProfile() ───────────────────────────────────────────────────────────

  describe('getProfile()', () => {
    it('retourne un objet { data }', async () => {
      setupGetProfileMocks()
      const result = await getProfile()
      expect(result).toHaveProperty('data')
    })

    it('data contient les champs utilisateur de base', async () => {
      setupGetProfileMocks()
      const { data } = await getProfile()
      expect(data.id_utilisateur).toBe(EXPECTED_ID)
      expect(data.email).toBe(EXPECTED_EMAIL)
      expect(data.nom).toBe('Benali')
      expect(data.prenom).toBe('Ahmed')
      expect(data.role).toBe('ETUDIANT')
    })

    it('data.etudiant existe et est un objet', async () => {
      setupGetProfileMocks()
      const { data } = await getProfile()
      expect(data.etudiant).toBeTruthy()
    })

    it('data.etudiant.competences a 2 items avec Vue.js en premier', async () => {
      setupGetProfileMocks()
      const { data } = await getProfile()
      expect(data.etudiant.competences).toHaveLength(2)
      expect(data.etudiant.competences[0].competence.nom).toBe('Vue.js')
    })

    it('data.etudiant.badges a 1 item', async () => {
      setupGetProfileMocks()
      const { data } = await getProfile()
      expect(data.etudiant.badges).toHaveLength(1)
      expect(data.etudiant.badges[0].badge.nom).toBe('Projet Excellence')
    })

    it('data.etudiant.participations_projets a 2 items', async () => {
      setupGetProfileMocks()
      const { data } = await getProfile()
      expect(data.etudiant.participations_projets).toHaveLength(2)
      expect(data.etudiant.participations_projets[0].projet.status_validation).toBe('VALIDE')
    })

    it('data.etudiant.depots_github est un tableau', async () => {
      setupGetProfileMocks()
      const { data } = await getProfile()
      expect(Array.isArray(data.etudiant.depots_github)).toBe(true)
    })

    it('appelle api.get /auth/me en premier', async () => {
      setupGetProfileMocks()
      await getProfile()
      expect(api.get).toHaveBeenCalledWith('/auth/me')
    })

    it('propage l\'erreur si api.get /auth/me échoue', async () => {
      api.get.mockRejectedValueOnce(new Error('Non autorisé'))
      await expect(getProfile()).rejects.toThrow('Non autorisé')
    })
  })

  // ── saveProfile() ──────────────────────────────────────────────────────────

  describe('saveProfile()', () => {
    it('retourne { data } après sauvegarde réussie', async () => {
      api.put.mockResolvedValueOnce({ data: { data: MOCK_ETUDIANT } })
      api.get
        .mockResolvedValueOnce({ data: { data: MOCK_ME } })
        .mockResolvedValueOnce({ data: { data: MOCK_COMPETENCES } })
        .mockResolvedValueOnce({ data: { data: MOCK_BADGES } })
      const result = await saveProfile(EXPECTED_ID, { prenom: 'Ahmed', nom: 'Benali', filiere: 'GINF' })
      expect(result).toHaveProperty('data')
    })

    it('data contient id_utilisateur et etudiant', async () => {
      api.put.mockResolvedValueOnce({ data: { data: MOCK_ETUDIANT } })
      api.get
        .mockResolvedValueOnce({ data: { data: MOCK_ME } })
        .mockResolvedValueOnce({ data: { data: MOCK_COMPETENCES } })
        .mockResolvedValueOnce({ data: { data: MOCK_BADGES } })
      const { data } = await saveProfile(EXPECTED_ID, { prenom: 'Ahmed', nom: 'Benali', filiere: 'GINF' })
      expect(data).toHaveProperty('id_utilisateur')
      expect(data).toHaveProperty('etudiant')
    })

    it('appelle api.put /etudiants/:id avec les champs étudiant', async () => {
      api.put.mockResolvedValueOnce({ data: { data: MOCK_ETUDIANT } })
      api.get
        .mockResolvedValueOnce({ data: { data: MOCK_ME } })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { data: [] } })
      await saveProfile(EXPECTED_ID, { prenom: 'Ahmed', nom: 'Benali', filiere: 'GINF' })
      expect(api.put).toHaveBeenCalledWith(`/etudiants/${EXPECTED_ID}`, expect.objectContaining({ filiere: 'GINF' }))
    })
  })

  // ── addSkill() ─────────────────────────────────────────────────────────────

  describe('addSkill()', () => {
    it('retourne { data: { competence, niveau_maitrise } }', async () => {
      const comp = { id_competence: 'comp-docker', nom: 'Docker', type: 'TECHNIQUE' }
      api.get.mockResolvedValueOnce({ data: { data: [] } })         // catalog vide → création
      api.post
        .mockResolvedValueOnce({ data: { data: comp } })             // création compétence
        .mockResolvedValueOnce({ data: { data: { niveau_maitrise: 'DEBUTANT' } } }) // association
      const { data } = await addSkill(EXPECTED_ID, 'Docker')
      expect(data.competence.nom).toBe('Docker')
      expect(data.niveau_maitrise).toBe('DEBUTANT')
    })

    it('réutilise la compétence si elle existe déjà dans le catalogue', async () => {
      const existing = { id_competence: 'comp-vue', nom: 'Vue.js', type: 'TECHNIQUE' }
      api.get.mockResolvedValueOnce({ data: { data: [existing] } }) // catalog avec Vue.js
      api.post.mockResolvedValueOnce({ data: { data: { niveau_maitrise: 'INTERMEDIAIRE' } } })
      const { data } = await addSkill(EXPECTED_ID, 'Vue.js', 'INTERMEDIAIRE')
      // api.post n'a été appelé qu'une fois (association seulement, pas création)
      expect(api.post).toHaveBeenCalledTimes(1)
      expect(data.competence.nom).toBe('Vue.js')
    })

    it('appelle POST /competences/ si compétence absente du catalogue', async () => {
      const newComp = { id_competence: 'comp-k8s', nom: 'Kubernetes', type: 'TECHNIQUE' }
      api.get.mockResolvedValueOnce({ data: { data: [] } })
      api.post
        .mockResolvedValueOnce({ data: { data: newComp } })
        .mockResolvedValueOnce({ data: { data: { niveau_maitrise: 'DEBUTANT' } } })
      await addSkill(EXPECTED_ID, 'Kubernetes')
      expect(api.post).toHaveBeenCalledWith('/competences/', expect.objectContaining({
        nom:  'Kubernetes',
        type: 'TECHNIQUE',
      }))
    })

    it('appelle POST /competences/etudiant/:id/:compId pour l\'association', async () => {
      const compId = 'comp-react'
      api.get.mockResolvedValueOnce({ data: { data: [{ id_competence: compId, nom: 'React', type: 'TECHNIQUE' }] } })
      api.post.mockResolvedValueOnce({ data: { data: { niveau_maitrise: 'DEBUTANT' } } })
      await addSkill(EXPECTED_ID, 'React')
      expect(api.post).toHaveBeenCalledWith(
        `/competences/etudiant/${EXPECTED_ID}/${compId}`,
        { niveau_maitrise: 'DEBUTANT' }
      )
    })

    it('utilise le niveau_maitrise fourni en paramètre', async () => {
      const comp = { id_competence: 'comp-ts', nom: 'TypeScript', type: 'TECHNIQUE' }
      api.get.mockResolvedValueOnce({ data: { data: [] } })
      api.post
        .mockResolvedValueOnce({ data: { data: comp } })
        .mockResolvedValueOnce({ data: { data: { niveau_maitrise: 'AVANCE' } } })
      const { data } = await addSkill(EXPECTED_ID, 'TypeScript', 'AVANCE')
      expect(data.niveau_maitrise).toBe('AVANCE')
    })

    it('propage l\'erreur si l\'association échoue', async () => {
      api.get.mockResolvedValueOnce({ data: { data: [] } })
      api.post
        .mockResolvedValueOnce({ data: { data: { id_competence: 'c1', nom: 'Docker' } } })
        .mockRejectedValueOnce(new Error('Association refusée'))
      await expect(addSkill(EXPECTED_ID, 'Docker')).rejects.toThrow('Association refusée')
    })
  })

  // ── Contrats d'interface ───────────────────────────────────────────────────

  describe('Contrats d\'interface', () => {
    it('getProfile — data contient tous les champs attendus', async () => {
      setupGetProfileMocks()
      const { data } = await getProfile()
      ;['id_utilisateur', 'email', 'nom', 'prenom', 'role', 'date_creation', 'etudiant']
        .forEach(c => expect(data).toHaveProperty(c))
    })

    it('getProfile — data.etudiant contient les sous-collections', async () => {
      setupGetProfileMocks()
      const { data } = await getProfile()
      ;['competences', 'badges', 'participations_projets', 'depots_github']
        .forEach(c => expect(data.etudiant).toHaveProperty(c))
    })
  })
})
