export function emptyForm() {
  return {
    entreprise: '',
    poste: '',
    adresse_entreprise: '',
    date_debut: '',
    date_fin: '',
    duree_semaines: null,
    missions: '',
    encadrant_professionnel: '',
    encadrant_academique: '',
    id_validateur: null,
    est_public: true,
  }
}

export function buildPayload(form) {
  const p = { ...form }
  const OPTIONALS = [
    'date_fin', 'adresse_entreprise', 'duree_semaines',
    'encadrant_professionnel', 'encadrant_academique',
  ]
  OPTIONALS.forEach(k => { if (!p[k]) { delete p[k] } })
  if (!p.id_validateur) delete p.id_validateur
  return p
}

export function formatStatut(s) {
  return { VALIDE: 'Validé', EN_ATTENTE: 'En attente', REJETE: 'Refusé' }[s] ?? s
}

export function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function niveauLabel(n) {
  return { DEBUTANT: 'Débutant', INTERMEDIAIRE: 'Intermédiaire', AVANCE: 'Avancé', EXPERT: 'Expert' }[n] ?? n
}

export function niveauClass(n) {
  return { DEBUTANT: 'lvl-green', INTERMEDIAIRE: 'lvl-yellow', AVANCE: 'lvl-orange', EXPERT: 'lvl-red' }[n] ?? ''
}

export function initials(user) {
  if (!user) return '?'
  return `${(user.prenom || '?')[0]}${(user.nom || '?')[0]}`.toUpperCase()
}
