import api from '@/services/api'

// ─── Config ───────────────────────────────────────────────────────────────────
const API_READY = false

// ─── Mock ─────────────────────────────────────────────────────────────────────
const MOCK_ME = {
  id_utilisateur: 'clx123456789abcdefghijk',
  email:          'ahmed.benali@etu.uae.ac.ma',
  nom:            'Benali',
  prenom:         'Ahmed',
  telephone:      '+212 6 12 34 56 78',
  photo:          null,
  role:           'ETUDIANT',
  date_creation:  '2023-09-01T00:00:00.000Z',
}

const MOCK_DEPOTS_GITHUB = [
  {
    id_depot:             'depot1',
    nom_depot:            'portfolio-app',
    url_github:           'https://github.com/ahmed/portfolio-app',
    description_github:   'Application portfolio Vue.js',
    nombre_commits:       42,
    langage_principal:    'Vue',
    date_dernier_commit:  '2024-05-10T00:00:00.000Z',
    date_synchronisation: '2024-06-01T00:00:00.000Z',
  },
]

const MOCK_ETUDIANT = {
  id_etudiant:            'clx123456789abcdefghijk',
  numero_etudiant:        'E2021001',
  filiere:                'GINF',
  annee:                  3,
  ville:                  'Fès',
  pays:                   'Maroc',
  biographie:             null,
  linkedin_url:           null,
  github_username:        null,
  site_web:               null,
  objectif_professionnel: null,
  score_credibilite:      0,
  niveau_credibilite:     'DEBUTANT',
  visibilite_profil:      'PUBLIC',
}

const MOCK_COMPETENCES = [
  { competence: { id_competence: 'comp1', nom: 'Vue.js',  type: 'TECHNIQUE', categorie: 'Frontend' }, niveau_maitrise: 'INTERMEDIAIRE' },
  { competence: { id_competence: 'comp2', nom: 'Python',  type: 'TECHNIQUE', categorie: 'Backend'  }, niveau_maitrise: 'DEBUTANT' },
]

const MOCK_BADGES = [
  {
    date_attribution: '2024-06-15T00:00:00.000Z',
    badge: { id_badge: 'badge1', nom: 'Projet Excellence', icone: '🏅', categorie: 'Projet' },
  },
]

const MOCK_PROJETS = [
  {
    est_createur: true,
    role_joue:    'Développeur fullstack',
    projet: { id_projet: 'proj1', titre: 'Système de gestion', description: 'Laravel + Vue.js', status_validation: 'VALIDE',     type_projet: 'PFA'    },
  },
  {
    est_createur: false,
    role_joue:    'Développeur mobile',
    projet: { id_projet: 'proj2', titre: 'App mobile de suivi', description: 'Flutter',          status_validation: 'EN_ATTENTE', type_projet: 'MODULE' },
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

/*
Axios extrait response.data (= StandardResponse) → .data = la ressource.
 */
function extractData(res) {
  const body = res?.data ?? res
  return body?.data ?? body
}


function assembleUser(me, etudiant, competences = [], badges = [], projets = [], depots = []) {
  return {
    // Champs Utilisateur — viennent de GET /auth/me
    id_utilisateur: me.id_utilisateur,
    email:          me.email,
    nom:            me.nom,
    prenom:         me.prenom,
    telephone:      me.telephone ?? null,
    photo:          me.photo     ?? null,   
    role:           me.role,
    date_creation:  me.date_creation ?? null,

    // Profil étudiant imbriqué — structure attendue par tous les composants
    etudiant: {
      ...etudiant,
      competences,
      badges,
      participations_projets: projets,
      depots_github: depots,   // pas de route listée dans la doc — à ajouter plus tard
    },
  }
}

// ─── Services ─────────────────────────────────────────────────────────────────

 
export async function getProfile() {
  if (!API_READY) {
    return { data: assembleUser(MOCK_ME, MOCK_ETUDIANT, MOCK_COMPETENCES, MOCK_BADGES, MOCK_PROJETS, MOCK_DEPOTS_GITHUB) }
  }
  // Étape 1 — récupérer l'utilisateur connecté (fournit l'id)
  const meRes = await api.get('/auth/me')
  const me    = extractData(meRes)
  const id    = me.id_utilisateur

  // Étape 2 — appels parallèles avec l'id
  const [etudiantRes, competencesRes, badgesRes] = await Promise.all([
    api.get(`/etudiants/${id}`),
    api.get(`/competences/etudiant/${id}`),
    api.get(`/badges/etudiant/${id}`),
    api.get(`/depots-github/etudiant/${id}`),
    // Projets : décommenter quand GET /projets?id_etudiant= est disponible côté backend
    // api.get('/projets', { params: { id_etudiant: id } }),
  ])

  const etudiant    = extractData(etudiantRes)
  const competences = extractData(competencesRes) ?? []
  const badges      = extractData(badgesRes)      ?? []
  const depots      = extractData(depotsRes)      ?? [] 

  return { data: assembleUser(me, etudiant, competences, badges) }
}


export async function saveProfile(id, formData) {
  // Séparer les champs Utilisateur des champs Etudiant
  const { prenom, nom, telephone, ...etudiantFields } = formData

  if (!API_READY) {
    const updatedMe = { ...MOCK_ME, prenom, nom, telephone }
    const updatedEt = { ...MOCK_ETUDIANT, ...etudiantFields }
    return { data: assembleUser(updatedMe, updatedEt, MOCK_COMPETENCES, MOCK_BADGES, MOCK_PROJETS) }
  }

  // Appel garanti : PUT /etudiants/{id}
  const etudiantRes = await api.put(`/etudiants/${id}`, etudiantFields)
  const etudiant    = extractData(etudiantRes)

  // Appel optionnel : PATCH /utilisateurs/{id}
  // Décommenter quand la route est disponible :
  // if (prenom || nom || telephone) {
  //   await api.patch(`/utilisateurs/${id}`, { prenom, nom, telephone })
  // }

  // Re-fetch me pour avoir les données fraîches
  const meRes = await api.get('/auth/me')
  const me    = extractData(meRes)

  return { data: assembleUser(me, etudiant, [], []) }
}


export async function addSkill(idEtudiant, nom, niveau_maitrise = 'DEBUTANT') {
  if (!API_READY) {
    return {
      data: {
        competence:      { id_competence: Date.now().toString(), nom, type: 'TECHNIQUE' },
        niveau_maitrise,
      }
    }
  }

  // Étape 1 — upsert catalogue
  const catalogRes   = await api.post('/competences', { nom, type: 'TECHNIQUE' })
  const competence   = extractData(catalogRes)

  // Étape 2 — associer à l'étudiant
  const assocRes = await api.post(
    `/competences/etudiant/${idEtudiant}/${competence.id_competence}`,
    { niveau_maitrise }
  )
  const assoc = extractData(assocRes)

  return {
    data: { competence, niveau_maitrise: assoc?.niveau_maitrise ?? niveau_maitrise }
  }
}


export async function uploadAvatar(id, file) {
  if (!API_READY) {
    return { data: { photo: URL.createObjectURL(file) } }
  }
  const form = new FormData()
  form.append('file', file)
  const res = await api.post(`/etudiants/${id}/avatar`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return { data: extractData(res) }
}