import api from '@/api'

const API_READY = true

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

const MOCK_ETUDIANT = {
  id_etudiant:            'clx123456789abcdefghijk',
  numero_etudiant:        'E2021001',
  filiere:                'GINF',
  annee:                  3,
  ville:                  'Fes',
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
  { competence: { id_competence: 'comp1', nom: 'Vue.js', type: 'TECHNIQUE', categorie: 'Frontend' }, niveau_maitrise: 'INTERMEDIAIRE' },
  { competence: { id_competence: 'comp2', nom: 'Python', type: 'TECHNIQUE', categorie: 'Backend'  }, niveau_maitrise: 'DEBUTANT' },
]

const MOCK_BADGES = [
  { date_attribution: '2024-06-15T00:00:00.000Z', badge: { id_badge: 'badge1', nom: 'Projet Excellence', icone: '🏅', categorie: 'Projet' } },
]

const MOCK_PROJETS = [
  { est_createur: true,  role_joue: 'Developpeur fullstack', projet: { id_projet: 'proj1', titre: 'Systeme de gestion',   description: 'Laravel + Vue.js', status_validation: 'VALIDE',     type_projet: 'PFA'    } },
  { est_createur: false, role_joue: 'Developpeur mobile',    projet: { id_projet: 'proj2', titre: 'App mobile de suivi', description: 'Flutter',          status_validation: 'EN_ATTENTE', type_projet: 'MODULE' } },
]

function extractData(res) {
  const body = res?.data ?? res
  return body?.data ?? body
}

function assembleUser(me, etudiant, competences = [], badges = [], projets = [], depots = []) {
  return {
    id_utilisateur: me.id_utilisateur,
    email:          me.email,
    nom:            me.nom,
    prenom:         me.prenom,
    telephone:      me.telephone ?? null,
    photo:          me.photo     ?? null,
    role:           me.role,
    date_creation:  me.date_creation ?? null,
    etudiant: {
      ...etudiant,
      competences,
      badges,
      participations_projets: projets,
      depots_github:          depots,
    },
  }
}

export async function getProfile() {
  if (!API_READY) {
    return { data: assembleUser(MOCK_ME, MOCK_ETUDIANT, MOCK_COMPETENCES, MOCK_BADGES, MOCK_PROJETS) }
  }

  try {
    const meRes = await api.get('/auth/me')
    const me    = extractData(meRes)
    const id    = me.id_utilisateur

    const [etudiantRes, competencesRes, badgesRes] = await Promise.all([
      api.get(`/etudiants/${id}`),
      api.get(`/competences/etudiant/${id}`),
      api.get(`/badges/etudiant/${id}`),
    ])

    const etudiant    = extractData(etudiantRes)            ?? MOCK_ETUDIANT
    const competences = extractData(competencesRes)         ?? []
    const badgesRaw   = extractData(badgesRes)
    const badges      = badgesRaw?.badges ?? badgesRaw      ?? []

    return { data: assembleUser(me, etudiant, competences, badges) }
  } catch (err) {
    console.error('[getProfile] erreur API → mock', err)
    return { data: assembleUser(MOCK_ME, MOCK_ETUDIANT, MOCK_COMPETENCES, MOCK_BADGES, MOCK_PROJETS) }
  }
}

export async function saveProfile(id, formData) {
  const {
    prenom, nom, telephone,
    score_credibilite, niveau_credibilite, id_validateur,
    id_etudiant, id_utilisateur, role, date_creation,
    date_modification, email_verifie, status_compte,
    ...etudiantFields
  } = formData

  if (!etudiantFields.filiere)         etudiantFields.filiere = 'GINF'
  if (!etudiantFields.numero_etudiant) delete etudiantFields.numero_etudiant
  if (!etudiantFields.adresse)         delete etudiantFields.adresse
  if (!etudiantFields.site_web)        delete etudiantFields.site_web

  if (!API_READY) {
    const updatedMe = { ...MOCK_ME, prenom, nom, telephone }
    const updatedEt = { ...MOCK_ETUDIANT, ...etudiantFields }
    return { data: assembleUser(updatedMe, updatedEt, MOCK_COMPETENCES, MOCK_BADGES, MOCK_PROJETS) }
  }

  try {
    const etudiantRes = await api.put(`/etudiants/${id}`, etudiantFields)
    const etudiant    = extractData(etudiantRes)

    const [meRes, competencesRes, badgesRes] = await Promise.all([
      api.get('/auth/me'),
      api.get(`/competences/etudiant/${id}`),
      api.get(`/badges/etudiant/${id}`),
    ])

    const me          = extractData(meRes)
    const competences = extractData(competencesRes)         ?? []
    const badgesRaw   = extractData(badgesRes)
    const badges      = badgesRaw?.badges ?? badgesRaw      ?? []

    return { data: assembleUser(me, etudiant, competences, badges) }
  } catch (err) {
    console.error('[saveProfile] erreur API → mock', err)
    return { data: assembleUser(MOCK_ME, MOCK_ETUDIANT) }
  }
}

export async function addSkill(idEtudiant, nom, niveau_maitrise = 'DEBUTANT') {
  if (!API_READY) {
    return {
      data: { competence: { id_competence: Date.now().toString(), nom, type: 'TECHNIQUE' }, niveau_maitrise }
    }
  }

  try {
    const catalogRes = await api.post('/competences', { nom, type: 'TECHNIQUE' })
    const competence = extractData(catalogRes)
    const assocRes   = await api.post(`/competences/etudiant/${idEtudiant}/${competence.id_competence}`, { niveau_maitrise })
    const assoc      = extractData(assocRes)
    return { data: { competence, niveau_maitrise: assoc?.niveau_maitrise ?? niveau_maitrise } }
  } catch (err) {
    console.error('[addSkill] erreur API', err)
    throw err
  }
}

export async function uploadAvatar(id, file) {
  if (!API_READY) {
    return { data: { photo: URL.createObjectURL(file) } }
  }

  try {
    const form = new FormData()
    form.append('file', file)
    const res = await api.post(`/etudiants/${id}/avatar`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return { data: extractData(res) }
  } catch (err) {
    console.error('[uploadAvatar] erreur API', err)
    throw err
  }
}