import api from './api.js'

// ── Helpers de validation ─────────────────────────────────────────────────────


const assertPositiveInt = (val, label) => {
  if (!Number.isInteger(val) || val <= 0) {
    throw new TypeError(`[profilService] ${label} doit être un entier positif, reçu : ${val}`)
  }
}

const ETUDIANT_ALLOWED_FIELDS = [
  'id_etudiant', 'ville', 'biographie',
  'linkedin_url', 'github_username', 'objectif_professionnel',
]

const sanitizeEtudiant = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  return ETUDIANT_ALLOWED_FIELDS.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(raw, key)) {
      acc[key] = raw[key]
    }
    return acc
  }, Object.create(null))
}


const REC_ALLOWED_FIELDS = ['id', 'id_etudiant', 'message', 'createdAt', 'auteur']
const sanitizeRecommandation = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  return REC_ALLOWED_FIELDS.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(raw, key)) {
      acc[key] = raw[key]
    }
    return acc
  }, Object.create(null))
}

// ── Candidats ───────────────────────────
export async function fetchCandidats() {
  const { data } = await api.get('/stages')
  const stages = Array.isArray(data.data) ? data.data : []

  const seen      = new Set()
  const etudiants = []

  for (const stage of stages) {
    // Validation : on n'accepte que des objets étudiant avec un id entier positif
    const e = stage?.etudiant
    if (
      e &&
      typeof e === 'object' &&
      Number.isInteger(e.id_etudiant) &&
      e.id_etudiant > 0 &&
      !seen.has(e.id_etudiant)
    ) {
      seen.add(e.id_etudiant)
      etudiants.push(sanitizeEtudiant(e))
    }
  }

  return etudiants
}

// ── Recommandations ───────────────────
export async function envoyerRecommandation(id_etudiant, message) {
  // Validation des paramètres avant tout appel réseau
  assertPositiveInt(id_etudiant, 'id_etudiant')

  if (typeof message !== 'string' || !message.trim()) {
    throw new TypeError('[profilService] message doit être une chaîne non vide')
  }
  if (message.length > 500) {
    throw new RangeError('[profilService] message dépasse la limite de 500 caractères')
  }

  // Nettoyage minimal : suppression des caractères de contrôle
  const safeMessage = message.trim().replace(/[\u0000-\u001F\u007F]/g, '')

  const { data } = await api.post('/recommandations', {
    id_etudiant,
    message: safeMessage,
  })

  return sanitizeRecommandation(data.data)
}

// ── Notifications ─────────────────────────────────────────────────────────────
export async function fetchNotifications() {
  const { data } = await api.get('/notifications')
  const raw = data.data

  if (!Array.isArray(raw)) return []

  // On ne retourne que des objets — on filtre les valeurs primitives ou null
  return raw.filter((n) => n && typeof n === 'object' && !Array.isArray(n))
}

export async function marquerNotificationLue(id_notification) {
  assertPositiveInt(id_notification, 'id_notification')
  await api.put(`/notifications/${id_notification}/lire`)
}