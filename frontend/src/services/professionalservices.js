/**
 * professionalservices.js
 * Couche service pour le module Professional.
 * Remplacez les fonctions mock par de vrais appels API (axios / fetch).
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

// ── Candidats ────────────────────────────────────────────────────────────────

/**
 * Récupère la liste des candidats disponibles pour recommandation.
 * @returns {Promise<Array>}
 */
export async function fetchCandidats() {
  const res = await fetch(`${BASE_URL}/candidats`)
  if (!res.ok) throw new Error('Erreur lors de la récupération des candidats')
  return res.json()
}

/**
 * Récupère le détail d'un candidat par son id.
 * @param {number} id
 * @returns {Promise<Object>}
 */
export async function fetchCandidatById(id) {
  const res = await fetch(`${BASE_URL}/candidats/${id}`)
  if (!res.ok) throw new Error(`Candidat ${id} introuvable`)
  return res.json()
}

// ── Recommandations ───────────────────────────────────────────────────────────

/**
 * Envoie une recommandation pour un candidat.
 * @param {Object} payload
 * @param {number} payload.candidatId
 * @param {string} payload.texte
 * @param {'rapide'|'officielle'} payload.type
 * @returns {Promise<Object>} recommandation créée
 */
export async function envoyerRecommandation(payload) {
  const res = await fetch(`${BASE_URL}/recommandations`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Erreur lors de l\'envoi de la recommandation')
  return res.json()
}

/**
 * Récupère toutes les recommandations émises par le professionnel connecté.
 * @returns {Promise<Array>}
 */
export async function fetchRecommandationsEmises() {
  const res = await fetch(`${BASE_URL}/recommandations/mes`)
  if (!res.ok) throw new Error('Erreur lors de la récupération des recommandations')
  return res.json()
}

// ── Favoris ───────────────────────────────────────────────────────────────────

/**
 * Ajoute un candidat aux favoris.
 * @param {number} candidatId
 * @returns {Promise<void>}
 */
export async function ajouterFavori(candidatId) {
  const res = await fetch(`${BASE_URL}/favoris`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ candidatId }),
  })
  if (!res.ok) throw new Error('Erreur lors de l\'ajout aux favoris')
}

/**
 * Supprime un candidat des favoris.
 * @param {number} candidatId
 * @returns {Promise<void>}
 */
export async function supprimerFavori(candidatId) {
  const res = await fetch(`${BASE_URL}/favoris/${candidatId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erreur lors de la suppression du favori')
}

// ── Notifications ─────────────────────────────────────────────────────────────

/**
 * Récupère les notifications d'activité récente.
 * @returns {Promise<Array>}
 */
export async function fetchNotifications() {
  const res = await fetch(`${BASE_URL}/notifications`)
  if (!res.ok) throw new Error('Erreur lors de la récupération des notifications')
  return res.json()
}

// ── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Récupère les statistiques d'activité du professionnel.
 * @returns {Promise<{ consultes: number, totalRecs: number }>}
 */
export async function fetchStats() {
  const res = await fetch(`${BASE_URL}/professional/stats`)
  if (!res.ok) throw new Error('Erreur lors de la récupération des stats')
  return res.json()
}