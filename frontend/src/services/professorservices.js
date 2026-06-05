import api from './api.js'

// ── Helpers ─────────────────

const assertPositiveInt = (val, label) => {
  if (!Number.isInteger(val) || val <= 0) {
    throw new TypeError(`[professorService] ${label} doit être un entier positif, reçu : ${val}`)
  }
}

const sanitizeStr = (val, maxLen = 500) =>
  typeof val === 'string'
    ? val.trim().replace(/[\u0000-\u001F\u007F]/g, '').slice(0, maxLen)
    : ''

/** Champs autorisés en retour pour un projet */
const PROJET_ALLOWED_FIELDS = [
  'id_projet', 'titre', 'type_projet', 'status_validation',
  'date_debut', 'description', 'est_visible_portfolio',
  'participations', 'technologies', 'createdAt', 'updatedAt',
]

const sanitizeProjet = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  return PROJET_ALLOWED_FIELDS.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(raw, key)) acc[key] = raw[key]
    return acc
  }, Object.create(null))
}

/** Champs autorisés en retour pour un stage */
const STAGE_ALLOWED_FIELDS = [
  'id_stage', 'id_etudiant', 'entreprise', 'poste',
  'date_debut', 'date_fin', 'missions', 'status_validation',
  'createdAt', 'updatedAt', 'etudiant',
]

const sanitizeStage = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  return STAGE_ALLOWED_FIELDS.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(raw, key)) acc[key] = raw[key]
    return acc
  }, Object.create(null))
}

// Décisions autorisées — empêche l'envoi de valeurs arbitraires
const VALID_DECISIONS = ['VALIDE', 'REJETE', 'EN_ATTENTE']
const assertValidDecision = (decision) => {
  if (!VALID_DECISIONS.includes(decision)) {
    throw new RangeError(`[professorService] décision invalide : ${decision}. Valeurs acceptées : ${VALID_DECISIONS.join(', ')}`)
  }
}

// ── Projets ─────────────────────
export async function fetchProjetsAValider() {
  const { data } = await api.get('/projets/a-valider')
  const raw = Array.isArray(data.data) ? data.data : []
  return raw.map(sanitizeProjet).filter(Boolean)
}

export async function validerProjet(id_projet, decision, commentaire = '', appreciation = '') {
  assertPositiveInt(id_projet, 'id_projet')
  assertValidDecision(decision)

  const { data } = await api.post(`/projets/${id_projet}/valider`, {
    decision,
    commentaire:  sanitizeStr(commentaire,  1000),
    appreciation: sanitizeStr(appreciation, 1000),
  })

  return sanitizeProjet(data.data)
}

// ── Stages ────────────────────────
export async function fetchStagesAValider() {
  const { data } = await api.get('/stages/a-valider')
  const raw = Array.isArray(data.data) ? data.data : []
  return raw.map(sanitizeStage).filter(Boolean)
}

export async function validerStage(id_stage, decision, commentaire = '') {
  assertPositiveInt(id_stage, 'id_stage')
  assertValidDecision(decision)

  const { data } = await api.post(`/stages/${id_stage}/valider`, {
    decision,
    commentaire: sanitizeStr(commentaire, 1000),
  })

  return sanitizeStage(data.data)
}

// ── Notifications ───────────
export async function fetchNotifications() {
  const { data } = await api.get('/notifications')
  const raw = data.data

  if (!Array.isArray(raw)) return []
  return raw.filter((n) => n && typeof n === 'object' && !Array.isArray(n))
}

export async function marquerNotificationLue(id_notification) {
  assertPositiveInt(id_notification, 'id_notification')
  await api.put(`/notifications/${id_notification}/lire`)
}
