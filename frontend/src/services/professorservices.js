/**
 * professorservices.js
 * Couche service pour le module Professor.
 * Remplacez les fonctions mock par de vrais appels API.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

// ── Projets ───────────────────────────────────────────────────────────────────

export async function fetchProjets() {
  const res = await fetch(`${BASE_URL}/projets`)
  if (!res.ok) throw new Error('Erreur récupération projets')
  return res.json()
}

export async function validerProjet(projetId) {
  const res = await fetch(`${BASE_URL}/projets/${projetId}/valider`, { method: 'PATCH' })
  if (!res.ok) throw new Error('Erreur validation projet')
  return res.json()
}

// ── Lettres de recommandation ─────────────────────────────────────────────────

export async function fetchLettres() {
  const res = await fetch(`${BASE_URL}/lettres`)
  if (!res.ok) throw new Error('Erreur récupération lettres')
  return res.json()
}

export async function signerLettre(lettreId) {
  const res = await fetch(`${BASE_URL}/lettres/${lettreId}/signer`, { method: 'PATCH' })
  if (!res.ok) throw new Error('Erreur signature lettre')
  return res.json()
}

// ── Étudiants ─────────────────────────────────────────────────────────────────

export async function fetchEtudiants() {
  const res = await fetch(`${BASE_URL}/etudiants`)
  if (!res.ok) throw new Error('Erreur récupération étudiants')
  return res.json()
}

// ── Stages ────────────────────────────────────────────────────────────────────

export async function fetchStages() {
  const res = await fetch(`${BASE_URL}/stages`)
  if (!res.ok) throw new Error('Erreur récupération stages')
  return res.json()
}

// ── Notifications ─────────────────────────────────────────────────────────────

export async function fetchNotifications() {
  const res = await fetch(`${BASE_URL}/professor/notifications`)
  if (!res.ok) throw new Error('Erreur récupération notifications')
  return res.json()
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export async function fetchStats() {
  const res = await fetch(`${BASE_URL}/professor/stats`)
  if (!res.ok) throw new Error('Erreur récupération stats')
  return res.json()
}