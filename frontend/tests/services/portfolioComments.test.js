import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import api from '@/services/api'
import {
  createPortfolioComment,
  getPortfolioComments,
  mapPortfolioComment,
} from '@/services/portfolioComments'

describe('portfolioComments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps the API author, content and date', () => {
    expect(mapPortfolioComment({
      id_commentaire: 'comment-1',
      contenu: 'Très bon portfolio',
      date_creation: '2026-06-11T10:00:00.000Z',
      status: 'VALIDE',
      auteur: { prenom: 'Sara', nom: 'Amrani', role: 'ADMINISTRATEUR' },
    })).toEqual({
      id: 'comment-1',
      content: 'Très bon portfolio',
      authorName: 'Sara Amrani',
      authorRole: 'ADMINISTRATEUR',
      createdAt: '2026-06-11T10:00:00.000Z',
      status: 'VALIDE',
    })
  })

  it('loads comments from the existing public endpoint', async () => {
    api.get.mockResolvedValue({
      data: {
        data: [{
          id_commentaire: 'comment-1',
          contenu: 'Bravo',
          auteur: { prenom: 'Ali', nom: 'Ben' },
        }],
      },
    })

    const comments = await getPortfolioComments('student-1')

    expect(api.get).toHaveBeenCalledWith('/commentaires/public/etudiant/student-1')
    expect(comments[0].authorName).toBe('Ali Ben')
  })

  it('creates a profile comment with the existing endpoint', async () => {
    api.post.mockResolvedValue({
      data: {
        data: {
          id_commentaire: 'comment-2',
          contenu: 'Excellent travail',
          status: 'EN_ATTENTE',
          auteur: { prenom: 'Nora', nom: 'Admin' },
        },
      },
    })

    const comment = await createPortfolioComment('student-2', 'Excellent travail')

    expect(api.post).toHaveBeenCalledWith('/commentaires/', {
      id_etudiant_cible: 'student-2',
      contenu: 'Excellent travail',
      type_cible: 'PROFIL',
    })
    expect(comment.status).toBe('EN_ATTENTE')
  })
})
