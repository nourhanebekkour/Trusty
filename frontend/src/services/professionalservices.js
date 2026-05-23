/**
 * professionalservices.js
 * Utilise src/services/api.js (instance Axios partagée avec token JWT)
 *
 * Routes backend :
 *   GET  /etudiants                     → liste des candidats
 *   GET  /recommandations/mes-recommandations-recus  → non applicable ici
 *   POST /recommandations               → envoyer une recommandation
 *   GET  /notifications                 → notifications du professionnel connecté
 *   PUT  /notifications/:id/lire        → marquer lue
 */

import api from './api.js'

// ── Candidats ─────────────────────────────────────────────────────────────────
export async function fetchCandidats() {
  const { data } = await api.get('/etudiants')
  return data.data ?? []
}

// ── Recommandations ───────────────────────────────────────────────────────────

/**
 * Récupère les recommandations émises par le professionnel connecté.
 * Le backend filtre par id_recommandeur = req.user.id
 */
export async function fetchRecommandationsEmises() {
  // La route GET /recommandations est admin only.
  // On retourne [] — les recs émises sont trackées localement (optimistic).
  return []
}

export async function envoyerRecommandation(id_etudiant, message) {
  const { data } = await api.post('/recommandations', { id_etudiant, message })
  return data.data
}

// ── Notifications ─────────────────────────────────────────────────────────────
export async function fetchNotifications() {
  const { data } = await api.get('/notifications')
  return data.data ?? []
}

export async function marquerNotificationLue(id_notification) {
  await api.put(`/notifications/${id_notification}/lire`)
}