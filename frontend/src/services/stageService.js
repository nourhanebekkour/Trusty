import api from '@/api'

// Les IDs sont des cuid() (strings).
const assertId = (val, label) => {
  if (typeof val !== 'string' || val.trim() === '') {
    throw new TypeError(`[stageService] ${label} doit être une chaîne non vide, reçu : ${val}`)
  }
}

const STAGE_ALLOWED_FIELDS = [
  'id_stage', 'id_etudiant',
  'entreprise', 'poste', 'adresse_entreprise',
  'encadrant_professionnel', 'encadrant_academique',
  'duree_semaines', 'date_debut', 'date_fin',
  'missions', 'est_public', 'status_validation',
  'id_rapport', 'rapport', 'rapport_url', 'technologies',
  'createdAt', 'updatedAt', 'etudiant',
]

const sanitizeStage = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  return STAGE_ALLOWED_FIELDS.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(raw, key)) {
      acc[key] = raw[key]
    }
    return acc
  }, Object.create(null))
}

const sanitizePayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('[stageService] payload invalide')
  }

  const sanitizeStr = (val, maxLen) =>
    typeof val === 'string'
      ? val.trim().replace(/[\u0000-\u001F\u007F]/g, '').slice(0, maxLen)
      : undefined

  const isValidDate = (val) =>
    typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val) && !isNaN(Date.parse(val))

  const safe = {}

  if (payload.entreprise  !== undefined) safe.entreprise  = sanitizeStr(payload.entreprise,  150)
  if (payload.poste       !== undefined) safe.poste       = sanitizeStr(payload.poste,        150)
  if (payload.missions    !== undefined) safe.missions    = sanitizeStr(payload.missions,     2000)
  if (payload.adresse_entreprise      !== undefined) safe.adresse_entreprise      = sanitizeStr(payload.adresse_entreprise,      200)
  if (payload.encadrant_professionnel !== undefined) safe.encadrant_professionnel = sanitizeStr(payload.encadrant_professionnel,  100)
  if (payload.encadrant_academique    !== undefined) safe.encadrant_academique    = sanitizeStr(payload.encadrant_academique,     100)

  if (payload.date_debut !== undefined) {
    if (!isValidDate(payload.date_debut)) throw new RangeError('[stageService] date_debut invalide')
    safe.date_debut = payload.date_debut
  }

  if (payload.date_fin !== undefined && payload.date_fin !== null && payload.date_fin !== '') {
    if (!isValidDate(payload.date_fin)) throw new RangeError('[stageService] date_fin invalide')
    if (safe.date_debut && payload.date_fin < safe.date_debut) {
      throw new RangeError('[stageService] date_fin antérieure à date_debut')
    }
    safe.date_fin = payload.date_fin
  }

  if (payload.duree_semaines !== undefined && payload.duree_semaines !== null && payload.duree_semaines !== '') {
    const dur = Number(payload.duree_semaines)
    if (!Number.isInteger(dur) || dur < 1 || dur > 104) {
      throw new RangeError('[stageService] duree_semaines doit être un entier entre 1 et 104')
    }
    safe.duree_semaines = dur
  }

  if (payload.est_public !== undefined) {
    if (typeof payload.est_public !== 'boolean') {
      throw new TypeError('[stageService] est_public doit être un booléen')
    }
    safe.est_public = payload.est_public
  }

  return safe
}

// ── API calls ─────────────────────────────────────────────────────────────────

/** GET /stages/etudiant/:id */
export async function fetchStagesEtudiant(idEtudiant) {
  assertId(idEtudiant, 'idEtudiant')

  const res    = await api.get(`/stages/etudiant/${idEtudiant}`)
  const stages = Array.isArray(res.data?.data) ? res.data.data
               : Array.isArray(res.data)        ? res.data
               : []

  return stages.map(sanitizeStage).filter(Boolean)
}

/** GET /stages/:id */
export async function fetchStageById(id) {
  const res = await api.get(`/stages/${id}`)
  return res.data?.data ?? res.data
}

/** POST /stages/etudiant/:id */
export async function creerStage(idEtudiant, payload) {
  assertId(idEtudiant, 'idEtudiant')

  const safePayload = sanitizePayload(payload)

  const res = await api.post(`/stages/etudiant/${idEtudiant}`, safePayload)
  return sanitizeStage(res.data?.data ?? res.data)
}

/** PUT /stages/:id */
export async function modifierStage(id, payload) {
  assertId(id, 'id')

  const safePayload = sanitizePayload(payload)

  const res = await api.put(`/stages/${id}`, safePayload)
  return sanitizeStage(res.data?.data ?? res.data)
}

/** DELETE /stages/:id */
export async function supprimerStage(id) {
  assertId(id, 'id')
  await api.delete(`/stages/${id}`)
}

/** POST /stages/:id/technologies/:techId */
export async function addTechToStage(stageId, techId, payload) {
  const res = await api.post(`/stages/${stageId}/technologies/${techId}`, payload)
  return res.data?.data ?? res.data
}

/** PUT /stages/:id/technologies/:techId */
export async function updateTechInStage(stageId, techId, payload) {
  const res = await api.put(`/stages/${stageId}/technologies/${techId}`, payload)
  return res.data?.data ?? res.data
}

/** DELETE /stages/:id/technologies/:techId */
export async function removeTechFromStage(stageId, techId) {
  await api.delete(`/stages/${stageId}/technologies/${techId}`)
}

/** POST /stages/:id/rapport */
export async function uploadRapport(stageId, file, onProgress) {
  const formData = new FormData()
  formData.append('fichier', file)
  const res = await api.post(`/stages/${stageId}/rapport`, formData, {
    onUploadProgress: onProgress,
  })
  return res.data?.data ?? res.data
}

/** DELETE /stages/:id/rapport */
export async function deleteRapport(stageId) {
  await api.delete(`/stages/${stageId}/rapport`)
}
