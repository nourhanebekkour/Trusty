import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getCompetence,
  getCompetenceByStudentId,
  addCompetence,
  addSkillToStudent,
  removeSkillFromStudent,
} from '@/services/competence.service'

vi.mock('@/api', () => ({
  default: {
    get:    vi.fn(),
    post:   vi.fn(),
    delete: vi.fn(),
  }
}))

import api from '@/api'

beforeEach(() => vi.clearAllMocks())

describe('getCompetence()', () => {
  it('appelle GET /competences', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })
    await getCompetence()
    expect(api.get).toHaveBeenCalledWith('/competences')
  })

  it('retourne data.data', async () => {
    const data = [{ id: 1, nom: 'Vue.js' }]
    api.get.mockResolvedValue({ data: { data } })
    const result = await getCompetence()
    expect(result).toEqual(data)
  })
})

describe('getCompetenceByStudentId()', () => {
  it('appelle GET /competences/etudiant/:id', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })
    await getCompetenceByStudentId(5)
    expect(api.get).toHaveBeenCalledWith('/competences/etudiant/5')
  })
})

describe('addCompetence()', () => {
  it('appelle POST /competences', async () => {
    api.post.mockResolvedValue({ data: { data: { id: 1 } } })
    await addCompetence({ nom: 'Node.js' })
    expect(api.post).toHaveBeenCalledWith('/competences', { nom: 'Node.js' })
  })
})

describe('addSkillToStudent()', () => {
  it('appelle POST /competences/etudiant/:id/:compId avec niveau DEBUTANT par défaut', async () => {
    api.post.mockResolvedValue({ data: { data: {} } })
    await addSkillToStudent(5, 10)
    expect(api.post).toHaveBeenCalledWith(
      '/competences/etudiant/5/10',
      { niveau_maitrise: 'DEBUTANT' }
    )
  })

  it('convertit le niveau 2 en INTERMEDIAIRE', async () => {
    api.post.mockResolvedValue({ data: { data: {} } })
    await addSkillToStudent(5, 10, 2)
    expect(api.post).toHaveBeenCalledWith(
      '/competences/etudiant/5/10',
      { niveau_maitrise: 'INTERMEDIAIRE' }
    )
  })

  it('convertit le niveau 3 en AVANCE', async () => {
    api.post.mockResolvedValue({ data: { data: {} } })
    await addSkillToStudent(5, 10, 3)
    expect(api.post).toHaveBeenCalledWith(
      '/competences/etudiant/5/10',
      { niveau_maitrise: 'AVANCE' }
    )
  })
})

describe('removeSkillFromStudent()', () => {
  it('appelle DELETE /competences/etudiant/:id/:compId', async () => {
    api.delete.mockResolvedValue({ data: {} })
    await removeSkillFromStudent(5, 10)
    expect(api.delete).toHaveBeenCalledWith('/competences/etudiant/5/10')
  })
})
