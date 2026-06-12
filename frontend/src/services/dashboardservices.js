import api from '@/services/api'

// ─── Helper extraction ────────────────────────────────────────────────────────
function extractData(res) {
  const body = res?.data ?? res
  // L'API retourne { success, message, data: [...] } ou directement [...]
  if (body?.data !== undefined) return body.data
  return body
}

function isEmpty(value) {
  if (value === null || value === undefined) return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

// ─── Helper affichage auteur ──────────────────────────────────────────────────
export function getAuteurLabel(auteur) {
  if (!auteur) return ''
  const role = auteur.role ?? auteur.utilisateur?.role

  if (role === 'PROFESSIONNEL') {
    const poste     = auteur.poste     ?? auteur.professionnel?.poste
    const entreprise = auteur.entreprise ?? auteur.professionnel?.entreprise
    return [poste, entreprise].filter(Boolean).join(' · ')
  }
  if (role === 'PROFESSEUR') {
    const specialite  = auteur.specialite  ?? auteur.professeur?.specialite
    const departement = auteur.departement ?? auteur.professeur?.departement
    return [specialite, departement].filter(Boolean).join(' · ')
  }
  if (role === 'ETUDIANT') {
    const filiere = auteur.filiere ?? auteur.etudiant?.filiere
    const annee   = auteur.annee   ?? auteur.etudiant?.annee
    return [filiere, annee ? `Année ${annee}` : null].filter(Boolean).join(' · ')
  }
  return auteur.poste ?? ''
}

// ─── Normalise un objet recommandation quelle que soit la forme API ──────────
// L'API peut retourner :
//   { id_recommandation, message, status, auteur: { nom, prenom, role, ... } }
// ou :
//   { id_recommandation, message, status,
//     recommandeur: { nom, prenom, role, professeur: {...}, professionnel: {...} } }
function normalizeReco(r) {
  // Extraire l'auteur depuis toutes les formes possibles
  const raw = r.auteur ?? r.recommandeur ?? r.utilisateur ?? null

  let auteur = null
  if (raw) {
    // Construire un objet auteur plat avec les infos disponibles
    const u = raw.utilisateur ?? raw  // si l'API imbrique utilisateur dans recommandeur
    auteur = {
      nom:    u.nom    ?? raw.nom    ?? '',
      prenom: u.prenom ?? raw.prenom ?? '',
      photo:  u.photo  ?? raw.photo  ?? null,
      role:   u.role   ?? raw.role   ?? '',
      // Détails selon le rôle — aplatir depuis les sous-objets si présents
      poste:        raw.professionnel?.poste        ?? raw.poste        ?? u.professionnel?.poste        ?? null,
      entreprise:   raw.professionnel?.entreprise   ?? raw.entreprise   ?? u.professionnel?.entreprise   ?? null,
      specialite:   raw.professeur?.specialite      ?? raw.specialite   ?? u.professeur?.specialite      ?? null,
      departement:  raw.professeur?.departement     ?? raw.departement  ?? u.professeur?.departement     ?? null,
      filiere:      raw.etudiant?.filiere            ?? raw.filiere      ?? u.etudiant?.filiere            ?? null,
    }
  }

  return {
    id_recommandation: r.id_recommandation,
    message:           r.message ?? '',
    status:            r.status  ?? 'EN_ATTENTE',
    date_creation:     r.date_creation ?? null,
    auteur,
  }
}

// ─── Normalise un objet projet ────────────────────────────────────────────────
function normalizeProject(p) {
  return {
    id: p.id_projet || p.id,
    titre: p.titre || p.nom || 'Sans titre',
    type: p.type_projet || p.type || '',
    status: p.status_validation || p.status || 'EN_ATTENTE',
    date_debut: p.date_debut || '',
    description: p.description || '',
    est_visible_portfolio: p.est_visible_portfolio ?? true,
    est_createur: p.est_createur ?? false,
    role_joue: p.role_joue || '',
    technologies: p.technologies || [],
    date_fin: p.date_fin || '',
    lien: p.lien || '',
  }
}

// ─── recalculerScore ──────────────────────────────────────────────────────────
export async function recalculerScore(idEtudiant) {
  try {
    const res = await api.post(`/etudiants/${idEtudiant}/recalculer-score`)
    const data = extractData(res)
    console.info('[recalculerScore] score mis à jour:', data)
    return data
  } catch (err) {
    console.error('[recalculerScore] erreur', err)
    return null
  }
}

// ─── fetchStats ───────────────────────────────────────────────────────────────
export async function fetchStats(idEtudiant) {
  try {
    const [etudiantRes, portfolioRes, projetsRes] = await Promise.all([
      api.get(`/etudiants/${idEtudiant}`),
      api.get('/portfolio/me'),
      api.get(`/projets/etudiant/${idEtudiant}`),
    ])

    const etudiant  = extractData(etudiantRes)
    const portfolios = extractData(portfolioRes)
    const projetsData = extractData(projetsRes)
    const projets = Array.isArray(projetsData) ? projetsData : []

    const vuesProfil = Array.isArray(portfolios)
      ? portfolios.reduce((sum, p) => sum + (p.nombre_vues || 0), 0)
      : 0

    const projetsCertifies = projets.filter(p => p.status_validation === 'VALIDE').length

    if (isEmpty(etudiant)) {
      return { projetsCertifies, credibilite: 0, vuesProfil, recommandations: 0 }
    }

    return {
      projetsCertifies,
      credibilite:      etudiant.score_credibilite ?? 0,
      vuesProfil,
      recommandations:  etudiant._count?.recommendation ?? 0,
    }
  } catch (err) {
    console.error('[fetchStats] erreur API', err)
    return { projetsCertifies: 0, credibilite: 0, vuesProfil: 0, recommandations: 0 }
  }
}

// ─── fetchProjects ────────────────────────────────────────────────────────────
export async function fetchProjects(idEtudiant) {
  try {
    const res  = await api.get(`/projets/etudiant/${idEtudiant}`)
    const data = extractData(res)

    if (!Array.isArray(data)) return []

    return data.map(normalizeProject)
  } catch (err) {
    console.error('[fetchProjects] erreur API', err)
    return []
  }
}

// ─── fetchRecos ───────────────────────────────────────────────────────────────
/**
 * Récupère les recommandations reçues par un étudiant.
 *
 * Stratégie à deux niveaux :
 *   1. GET /recommandations/mes-recommandations-recus  (utilisateur connecté)
 *      → endpoint le plus précis, retourne uniquement les recommandations de l'étudiant connecté
 *      → inclut toutes les recommandations (EN_ATTENTE, VALIDE, REJETE)
 *
 *   2. GET /recommandations/public/etudiant/{id}  (fallback)
 *      → endpoint public, retourne uniquement les recommandations VALIDE
 *      → utile si le premier endpoint échoue ou si on consulte un autre profil
 *
 * Les deux réponses sont normalisées via normalizeReco() pour gérer
 * les différentes structures possibles retournées par le backend.
 */
export async function fetchRecos(idEtudiant) {
  // ── Tentative 1 : endpoint "mes recommandations reçues" (connecté) ──────────
  try {
    const res  = await api.get('/recommandations/mes-recommandations-recus')
    const data = extractData(res)

    if (Array.isArray(data) && !isEmpty(data)) {
      const normalized = data.map(normalizeReco)
      const sorted = [
        ...normalized.filter(r => r.status === 'VALIDE'),
        ...normalized.filter(r => r.status === 'EN_ATTENTE'),
        ...normalized.filter(r => r.status !== 'VALIDE' && r.status !== 'EN_ATTENTE'),
      ]
      return sorted
    }
  } catch (err) {
    console.warn('[fetchRecos] /mes-recommandations-recus échoué', err?.response?.status)
  }

  // ── Tentative 2 : endpoint public (VALIDE uniquement) ──────────────────────
  try {
    const res  = await api.get(`/recommandations/public/etudiant/${idEtudiant}`)
    const data = extractData(res)

    if (Array.isArray(data) && !isEmpty(data)) {
      return data.map(normalizeReco).filter(r => r.status === 'VALIDE')
    }
  } catch (err) {
    console.error('[fetchRecos] les deux endpoints ont échoué', err)
  }

  return []
}
