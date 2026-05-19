// ─── services/stageService.js ──────────────────────────────────────────────
import api from '@/api'

/** GET /stages/etudiant/:id */
export async function fetchStagesEtudiant(idEtudiant) {
  const res = await api.get(`/stages/etudiant/${idEtudiant}`)
  return res.data?.data ?? []
}

/** POST /stages/etudiant/:id */
export async function creerStage(idEtudiant, payload) {
  const res = await api.post(`/stages/etudiant/${idEtudiant}`, payload)
  return res.data?.data ?? res.data
}

/** PUT /stages/:id */
export async function modifierStage(id, payload) {
  const res = await api.put(`/stages/${id}`, payload)
  return res.data?.data ?? res.data
}

/** DELETE /stages/:id */
export async function supprimerStage(id) {
  await api.delete(`/stages/${id}`)
}