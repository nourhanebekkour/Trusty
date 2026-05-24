import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchCandidats,
  envoyerRecommandation as apiEnvoyerRecommandation,
  fetchNotifications,
  marquerNotificationLue,
} from '@/services/professionalservices.js'

// ── Helpers visuels exportés ───────────────────────────────────────────────────

const GRADIENTS = [
  'linear-gradient(135deg,#378ADD,#85B7EB)',
  'linear-gradient(135deg,#D4537E,#ED93B1)',
  'linear-gradient(135deg,#1D9E75,#5DCAA5)',
  'linear-gradient(135deg,#BA7517,#EF9F27)',
]

function hashId(id) {
  const str = String(id)
  let h = 0
  for (let i = 0; i < str.length; i++) h += str.charCodeAt(i)
  return h
}

export function normaliserCandidat(e) {
  const u        = e.utilisateur ?? {}
  const prenom   = u.prenom ?? ''
  const nom      = u.nom    ?? ''
  const hasName  = prenom || nom
  return {
    id:          e.id_etudiant,
    nom:         hasName ? `${prenom} ${nom}`.trim() : `Étudiant ${e.id_etudiant?.slice(-4) ?? ''}`,
    initiales:   hasName ? `${prenom[0] ?? '?'}${nom[0] ?? '?'}`.toUpperCase() : '??',
    formation:   e.filiere ?? '',
    ecole:       'ENSA',
    ville:       e.ville ?? '',
    score:       e.score_credibilite ?? 0,
    gradient:    GRADIENTS[hashId(e.id_etudiant) % GRADIENTS.length],
    icon:        'user',
    color:       'blue',
    description: e.biographie ?? e.objectif_professionnel ?? '',
  }
}

export function normaliserNotif(n, index, total) {
  return {
    id:      n.id_notification,
    nom:     n.titre ?? '',
    message: n.message ?? '',
    time:    new Date(n.date_creation).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
    color:   n.est_lue ? '#a0b4ae' : '#66c99f',
    last:    index === total - 1,
  }
}

export function normaliserRec(r) {
  const u      = r.cible?.utilisateur ?? r.auteur ?? {}
  const prenom = u.prenom ?? ''
  const nom    = u.nom    ?? ''
  const date   = new Date(r.date_creation)
  const mois   = date.toLocaleString('fr-FR', { month: 'long' })
  return {
    candidatId: r.id_etudiant,
    nom:        `${prenom} ${nom}`.trim(),
    initiales:  `${prenom[0] ?? '?'}${nom[0] ?? '?'}`.toUpperCase(),
    gradient:   GRADIENTS[0],
    type:       'officielle',
    extrait:    r.message ? (r.message.length > 60 ? r.message.slice(0, 60) + '…' : r.message) : '',
    date:       `${mois.charAt(0).toUpperCase() + mois.slice(1)} ${date.getFullYear()}`,
  }
}

// ── Store ──────────────────────────────────────────────────────────────────────

export const useProfessionalStore = defineStore('professional', () => {

  // ── État
  const candidats     = ref([])
  const recsEmises    = ref([])
  const notifications = ref([])
  const favoris       = ref([])
  const consultes     = ref(0)
  const loading       = ref({ candidats: false, notifs: false })
  const erreur        = ref(null)

  // ── Getters
  const totalRecs          = computed(() => recsEmises.value.length)
  const candidatsFavoris   = computed(() => candidats.value.filter(c => favoris.value.includes(c.id)))
  const candidatsEnAttente = computed(() => candidats.value.filter(c => !aRecommande(c.id)).length)

  // ── Actions API

  async function chargerCandidats() {
    loading.value.candidats = true
    erreur.value = null
    try {
      const data = await fetchCandidats()
      candidats.value = data.map(normaliserCandidat)
    } catch (e) {
      erreur.value = e.message
    } finally {
      loading.value.candidats = false
    }
  }

  async function chargerNotifications() {
    loading.value.notifs = true
    try {
      const data = await fetchNotifications()
      notifications.value = data.map((n, i) => normaliserNotif(n, i, data.length))
    } catch (e) {
      erreur.value = e.message
    } finally {
      loading.value.notifs = false
    }
  }

  async function envoyerRecommandation(candidat, texte, type) {
    try {
      await apiEnvoyerRecommandation(candidat.id, texte)
      const now  = new Date()
      const mois = now.toLocaleString('fr-FR', { month: 'long' })
      recsEmises.value.unshift({
        candidatId: candidat.id,
        nom:        candidat.nom,
        initiales:  candidat.initiales,
        gradient:   candidat.gradient,
        type,
        extrait:    texte.length > 60 ? texte.slice(0, 60) + '…' : texte,
        date:       `${mois.charAt(0).toUpperCase() + mois.slice(1)} ${now.getFullYear()}`,
      })
      notifications.value.unshift({
        id:      Date.now(),
        nom:     '',
        message: `Recommandation envoyée à ${candidat.nom}`,
        time:    "À l'instant",
        color:   '#66c99f',
        last:    false,
      })
    } catch (e) {
      erreur.value = e.message
      throw e
    }
  }

  async function marquerLue(id) {
    try {
      await marquerNotificationLue(id)
      const notif = notifications.value.find(n => n.id === id)
      if (notif) notif.color = '#a0b4ae'
    } catch (e) {
      erreur.value = e.message
    }
  }

  // ── Actions locales

  function aRecommande(id) {
    return recsEmises.value.some(r => r.candidatId === id)
  }

  function incrementerConsultes() {
    consultes.value++
  }

  function toggleFavori(id) {
    const index = favoris.value.indexOf(id)
    if (index === -1) favoris.value.push(id)
    else favoris.value.splice(index, 1)
  }

  async function init() {
    await Promise.all([
      chargerCandidats(),
      chargerNotifications(),
    ])
  }

  return {
    candidats, recsEmises, notifications, favoris, consultes, loading, erreur,
    totalRecs, candidatsFavoris, candidatsEnAttente,
    init, chargerCandidats, chargerNotifications,
    envoyerRecommandation, marquerLue,
    aRecommande, incrementerConsultes, toggleFavori,
  }
})
