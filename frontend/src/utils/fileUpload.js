export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024

export function validateUploadFile(file, { allowImages = true, allowPdf = true } = {}) {
  if (!file) return 'Aucun fichier selectionne.'
  if (!file.size) return 'Le fichier est vide.'
  if (file.size > MAX_UPLOAD_SIZE) return 'Le fichier ne doit pas depasser 10 Mo.'

  const isImage = typeof file.type === 'string' && file.type.startsWith('image/')
  const isPdf = file.type === 'application/pdf'

  if ((allowImages && isImage) || (allowPdf && isPdf)) return null
  if (allowImages && allowPdf) return 'Format non supporte. Utilisez une image ou un fichier PDF.'
  if (allowImages) return 'Format non supporte. Utilisez une image.'
  return 'Format non supporte. Utilisez un fichier PDF.'
}

export function getUploadErrorMessage(error, fallback = "Erreur lors de l'upload du fichier.") {
  const status = error?.response?.status
  const apiMessage = error?.response?.data?.message || error?.response?.data?.error

  if (apiMessage) return apiMessage
  if (status === 400) return 'Fichier invalide ou requete incorrecte.'
  if (status === 401) return 'Votre session a expire. Veuillez vous reconnecter.'
  if (status === 403) return "Vous n'etes pas autorise a importer ce fichier."
  if (status === 413) return 'Le fichier est trop volumineux.'
  if (status >= 500) return 'Le serveur ne peut pas enregistrer le fichier pour le moment.'
  return fallback
}
