import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchCandidats,
  fetchRecommandationsEmises,
  envoyerRecommandation as apiEnvoyerRecommandation,
  fetchNotifications,
} from '@/services/professionalservices.js'

export const useProfessionalStore = defineStore('professional', () => {

  // ── État
  const candidats     = ref([])
  const recsEmises    = ref([])
  const notifications = ref([])
  const favoris       = ref([])
  const statsActivite = ref({ consultes: 0 })
  const loading       = ref({ candidats: false, recs: false, notifs: false })
  const erreur        = ref(null)

  // ── Getters
  const totalRecs          = computed(() => recsEmises.value.length)
  const candidatsFavoris   = computed(() => candidats.value.filter(c => favoris.value.includes(c.id)))
  const candidatsEnAttente = computed(() => candidats.value.filter(c => !aRecommande(c.id)).length)

  // ── Normalisation backend → composants

  function normaliserCandidat(e) {
    const u = e.utilisateur ?? {}
    const prenom = u.prenom ?? ''
    const nom    = u.nom    ?? ''
    const initiales = `${prenom[0] ?? '?'}${nom[0] ?? '?'}`.toUpperCase()
    const couleurs = [
      'linear-gradient(135deg,#378ADD,#85B7EB)',
      'linear-gradient(135deg,#D4537E,#ED93B1)',
      'linear-gradient(135deg,#1D9E75,#5DCAA5)',
      'linear-gradient(135deg,#BA7517,#EF9F27)',
    ]
    const gradient = couleurs[e.id_etudiant.charCodeAt(0) % couleurs.length]
    return {
      id:          e.id_etudiant,
      nom:         `${prenom} ${nom}`.trim(),
      initiales,
      formation:   e.filiere ?? '',
      ecole:       'ENSA',
      ville:       e.ville ?? '',
      score:       e.score_credibilite ?? 0,
      gradient,
      icon:        'user',
      color:       'blue',
      description: e.biographie ?? e.objectif_professionnel ?? '',
    }
  }

  function normaliserRec(r) {
    const u = r.cible?.utilisateur ?? r.auteur ?? {}
    const prenom = u.prenom ?? ''
    const nom    = u.nom    ?? ''
    const initiales = `${prenom[0] ?? '?'}${nom[0] ?? '?'}`.toUpperCase()
    const date  = new Date(r.date_creation)
    const mois  = date.toLocaleString('fr-FR', { month: 'long' })
    return {
      candidatId: r.id_etudiant,
      nom:        `${prenom} ${nom}`.trim(),
      initiales,
      gradient:   'linear-gradient(135deg,#378ADD,#85B7EB)',
      type:       'officielle',
      extrait:    r.message ? (r.message.length > 60 ? r.message.slice(0, 60) + '…' : r.message) : '',
      date:       `${mois.charAt(0).toUpperCase() + mois.slice(1)} ${date.getFullYear()}`,
    }
  }

  function normaliserNotif(n, index, total) {
    return {
      id:      n.id_notification,
      nom:     n.titre ?? '',
      message: n.message ?? '',
      time:    new Date(n.date_creation).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      color:   n.est_lue ? '#a0b4ae' : '#66c99f',
      last:    index === total - 1,
    }
  }

  // ── Actions

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

  async function chargerRecommandations() {
    loading.value.recs = true
    try {
      const data = await fetchRecommandationsEmises()
      recsEmises.value = data.map(normaliserRec)
    } catch (e) {
      erreur.value = e.message
    } finally {
      loading.value.recs = false
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
      })
    } catch (e) {
      erreur.value = e.message
      throw e
    }
  }

  function aRecommande(id) {
    return recsEmises.value.some(r => r.candidatId === id)
  }

  function incrementerConsultes() {
    statsActivite.value.consultes++
  }

  async function init() {
    await Promise.all([
      chargerCandidats(),
      chargerRecommandations(),
      chargerNotifications(),
    ])
  }

  return {
    candidats, recsEmises, notifications, favoris, statsActivite, loading, erreur,
    totalRecs, candidatsFavoris, candidatsEnAttente,
    init, chargerCandidats, chargerRecommandations, chargerNotifications,
    envoyerRecommandation, aRecommande, incrementerConsultes,
  }
})