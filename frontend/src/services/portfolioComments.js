import api from '@/services/api'

function unwrapData(response) {
  return response?.data?.data ?? response?.data ?? null
}

export function mapPortfolioComment(comment) {
  const author = comment?.auteur ?? {}

  return {
    id: comment?.id_commentaire ?? comment?.id,
    content: comment?.contenu ?? comment?.content ?? '',
    authorName: `${author.prenom ?? ''} ${author.nom ?? ''}`.trim() || 'Utilisateur',
    authorRole: author.role ?? '',
    createdAt: comment?.date_creation ?? comment?.createdAt ?? '',
    status: comment?.status ?? 'VALIDE',
  }
}

export async function getPortfolioComments(studentId) {
  const response = await api.get(`/commentaires/public/etudiant/${studentId}`)
  const comments = unwrapData(response)

  return Array.isArray(comments) ? comments.map(mapPortfolioComment) : []
}

export async function createPortfolioComment(studentId, content) {
  const response = await api.post('/commentaires/', {
    id_etudiant_cible: studentId,
    contenu: content,
    type_cible: 'PROFIL',
  })

  return mapPortfolioComment(unwrapData(response) ?? {})
}
