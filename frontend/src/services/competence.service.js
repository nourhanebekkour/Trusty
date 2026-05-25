import api from "@/api"

const NIVEAU_MAP = {
  1: 'DEBUTANT',
  2: 'INTERMEDIAIRE',
  3: 'AVANCE',
}

export const getCompetence = async () => {
  const response = await api.get("/competences")
  return response.data.data
}

export const getCompetenceByStudentId = async (id_etudiant) => {
  const response = await api.get(`/competences/etudiant/${id_etudiant}`)
  return response.data.data
}

export const addCompetence = async (competence) => {
  const response = await api.post(`/competences`, competence)
  return response.data.data
}

export const addSkillToStudent = async (id_etudiant, id_competence, niveau_maitrise = 1) => {
  const response = await api.post(
    `/competences/etudiant/${id_etudiant}/${id_competence}`,
    { niveau_maitrise: NIVEAU_MAP[niveau_maitrise] ?? 'DEBUTANT' }
  )
  return response.data.data
}

export const removeSkillFromStudent = async (id_etudiant, id_competence) => {
  const response = await api.delete(
    `/competences/etudiant/${id_etudiant}/${id_competence}`
  )
  return response.data
}