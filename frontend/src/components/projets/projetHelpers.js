// ── Helpers partagés entre composants projets ──────────────────────────────

export function nomComplet(etudiant) {
  if (!etudiant) return '—'
  const u = etudiant.utilisateur
  if (u?.prenom || u?.nom) return `${u.prenom ?? ''} ${u.nom ?? ''}`.trim()
  return etudiant.github_username
    ? `@${etudiant.github_username}`
    : `Étudiant …${etudiant.id_etudiant?.slice(-4) ?? ''}`
}

export function initiales(etudiant) {
  if (!etudiant) return '?'
  const u = etudiant.utilisateur
  if (u) return `${(u.prenom ?? '')[0] ?? ''}${(u.nom ?? '')[0] ?? ''}`.toUpperCase() || '?'
  return (etudiant.github_username ?? '?')[0].toUpperCase()
}

export function formatType(t) {
  const map = {
    MODULE: 'Module', INTEGRATION: 'Intégration', PFA: 'PFA', PFE: 'PFE',
    HACKATHON: 'Hackathon', PERSONNEL: 'Personnel', STAGE: 'Stage', AUTRE: 'Autre',
  }
  return map[t] ?? t
}

export function formatStatut(s) {
  return { VALIDE: 'Validé', EN_ATTENTE: 'En attente', REJETE: 'Refusé' }[s] ?? s
}

export function formatNiveau(n) {
  return {
    DEBUTANT: 'Débutant', INTERMEDIAIRE: 'Intermédiaire',
    AVANCE: 'Avancé', EXPERT: 'Expert',
  }[n] ?? n
}

export function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function emptyForm() {
  return {
    titre:                 '',
    type_projet:           '',
    description:           '',
    date_debut:            '',
    date_fin:              '',
    lien_github:           '',
    lien_youtube:          '',
    lien_demo:             '',
    resultats_obtenus:     '',
    nombre_collaborateurs: 1,
    est_public:            true,
  }
}

export function buildPayload(form) {
  const p = { ...form }
  const OPTIONALS = ['date_fin', 'lien_github', 'lien_youtube', 'lien_demo', 'resultats_obtenus']
  OPTIONALS.forEach(k => { if (!p[k]) delete p[k] })
  return p
}

export function badgeClass(status) {
  return {
    VALIDE: 'badge--valide',
    EN_ATTENTE: 'badge--attente',
    REJETE: 'badge--rejete',
  }[status] ?? ''
}

export function participantsList(participations) {
  if (!participations?.length) return '—'
  return participations.map(p => nomComplet(p.etudiant)).join(', ')
}

export function firstParticipantInitials(participations) {
  if (!participations?.length) return '?'
  return initiales(participations[0].etudiant)
}