import api from '@/services/api'

// ─── Mock ─────────────────────────────────────────────────────────────────────
// À supprimer quand le backend est prêt + passer API_READY à true

const API_READY = false  // ← mettre true quand le backend est déployé

const MOCK_USER = {
  id_utilisateur: 'clx123abc',
  email:          'ahmed.benali@etu.uae.ac.ma',
  nom:            'Benali',
  prenom:         'Ahmed',
  telephone:      '+212 6 12 34 56 78',
  role:           'ETUDIANT',
  date_creation:  '2023-09-01T00:00:00.000Z',
  etudiant: {
    ville:    'Fès',
    pays:     'Maroc',
    filiere:  'GINF',
    specialite: null,
    competences: [
      { competence: { id_competence: 'comp1', nom: 'Vue.js'  } },
      { competence: { id_competence: 'comp2', nom: 'Python'  } },
    ],
    badges: [
      {
        date_attribution: '2024-06-15T00:00:00.000Z',
        badge: { id_badge: 'badge1', nom: 'Projet Excellence', icone: '🏅' },
      },
    ],
    depots_github: [
      {
        id_depot:            'depot1',
        nom_depot:           'my-portfolio',
        url_github:          'https://github.com/ahmed/my-portfolio',
        description_github:  'Portfolio personnel en Vue.js',
        langage_principal:   'JavaScript',
      },
    ],
    participations_projets: [
      {
        projet: {
          id_projet:         'proj1',
          titre:             'Système de gestion des étudiants',
          description:       'Application web fullstack avec Laravel et Vue.js',
          status_validation: 'VALIDE',
        },
      },
      {
        projet: {
          id_projet:         'proj2',
          titre:             'Application mobile de suivi',
          description:       'App Flutter pour le suivi académique',
          status_validation: 'EN_ATTENTE',
        },
      },
    ],
  },
}

// ─── Services ─────────────────────────────────────────────────────────────────

export async function getProfile() {
  if (!API_READY) return { data: MOCK_USER }
  try {
    return await api.get('/profile')
  } catch {
    return { data: MOCK_USER }
  }
}

export async function patchProfile(id, formData) {
  if (!API_READY) {
    // Simule la réponse PATCH : même structure que GET avec les champs mis à jour
    const updated = {
      ...MOCK_USER,
      ...formData,
      etudiant: { ...MOCK_USER.etudiant, ville: formData.ville ?? MOCK_USER.etudiant.ville },
    }
    return { data: updated }
  }
  try {
    return await api.patch(`/utilisateurs/${id}`, formData)
  } catch (err) {
    throw err
  }
}

export async function addSkill(nom) {
  if (!API_READY) {
    return { data: { competence: { id_competence: Date.now().toString(), nom } } }
  }
  return await api.post('/competences', { nom })
}