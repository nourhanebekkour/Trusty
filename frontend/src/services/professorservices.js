/**
 * professorservices.js
 * Utilise src/services/api.js (instance Axios partagée avec token JWT)
 *
 * Routes backend :
 *   GET  /projets/a-valider         → projets en attente du professeur connecté
 *   POST /projets/:id/valider       → valider/rejeter un projet
 *   GET  /stages/a-valider          → stages en attente du professeur connecté
 *   POST /stages/:id/valider        → valider/rejeter un stage
 *   GET  /etudiants                 → liste des étudiants
 *   GET  /notifications             → notifications du professeur
 *   PUT  /notifications/:id/lire    → marquer lue
 */

import api from './api.js'

// ── Projets ───────────────────────────────────────────────────────────────────
export async function fetchProjetsAValider() {
  const { data } = await api.get('/projets/a-valider')
  return data.data ?? []
}

export async function validerProjet(id_projet, decision, commentaire = '', appreciation = '') {
  const { data } = await api.post(`/projets/${id_projet}/valider`, {
    decision,
    commentaire,
    appreciation,
  })
  return data.data
}

// ── Stages ────────────────────────────────────────────────────────────────────
export async function fetchStagesAValider() {
  const { data } = await api.get('/stages/a-valider')
  return data.data ?? []
}

export async function validerStage(id_stage, decision, commentaire = '') {
  const { data } = await api.post(`/stages/${id_stage}/valider`, {
    decision,
    commentaire,
  })
  return data.data
}

// ── Étudiants ─────────────────────────────────────────────────────────────────
export async function fetchEtudiants() {
  const { data } = await api.get('/etudiants')
  return data.data ?? []
}

// ── Notifications ─────────────────────────────────────────────────────────────
export async function fetchNotifications() {
  const { data } = await api.get('/notifications')
  return data.data ?? []
}

export async function marquerNotificationLue(id_notification) {
  await api.put(`/notifications/${id_notification}/lire`)
}