import api from '@/api'

/** GET /stages/etudiant/:id */
export async function fetchStagesEtudiant(idEtudiant) {
  const res = await api.get(`/stages/etudiant/${idEtudiant}`)
  return res.data?.data ?? []
}

/** GET /stages/:id */
export async function fetchStageById(id) {
  const res = await api.get(`/stages/${id}`)
  return res.data?.data ?? res.data
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
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress,
  })
  return res.data?.data ?? res.data
}

/** DELETE /stages/:id/rapport */
export async function deleteRapport(stageId) {
  await api.delete(`/stages/${stageId}/rapport`)
}
