import api from '../api.js'

// ── Candidats ──────────────────────────────────────────────────────────────────
// GET /etudiants requires ADMINISTRATEUR — not accessible to PROFESSIONNEL.
// Workaround: derive unique students from the public stages list.
// Limitation: utilisateur (nom/prenom) is not included in GET /stages response.
export async function fetchCandidats() {
  const { data } = await api.get('/stages')
  const stages = data.data ?? []
  const seen = new Set()
  const etudiants = []
  for (const stage of stages) {
    const e = stage.etudiant
    if (e?.id_etudiant && !seen.has(e.id_etudiant)) {
      seen.add(e.id_etudiant)
      etudiants.push(e)
    }
  }
  return etudiants
}

// ── Recommandations ───────────────────────────────────────────────────────────
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
