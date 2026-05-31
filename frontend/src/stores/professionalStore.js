import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  fetchCandidats,
  envoyerRecommandation as apiEnvoyerRecommandation,
  fetchNotifications,
  marquerNotificationLue,
} from '@/services/professionalservices.js'

const GRADIENTS = [
  'linear-gradient(135deg,#5C8C6A,#D6EDE8)',
  'linear-gradient(135deg,#378ADD,#D8EEF9)',
  'linear-gradient(135deg,#A87832,#FFF2C9)',
  'linear-gradient(135deg,#8E5AD8,#EDE4FF)',
]

function hashId(id) {
  const str = String(id || '')
  let h = 0
  for (let i = 0; i < str.length; i++) h += str.charCodeAt(i)
  return h
}

export function normaliserCandidat(e) {
  const u = e.utilisateur ?? {}
  const prenom = u.prenom ?? ''
  const nom = u.nom ?? ''
  const hasName = prenom || nom
  const shortId = e.id_etudiant?.slice?.(-4)?.toUpperCase?.() || '----'
  const sources = Array.isArray(e.sources) ? e.sources : []
  const sourceLabel = sources.length ? sources.join(' + ') : 'API partielle'

  return {
    id: e.id_etudiant,
    nom: hasName ? `${prenom} ${nom}`.trim() : `Etudiant ${shortId}`,
    initiales: hasName ? `${prenom[0] ?? '?'}${nom[0] ?? '?'}`.toUpperCase() : shortId.slice(-2),
    formation: e.filiere || e.last_activity_label || 'Profil etudiant',
    ecole: u.ecole || 'Ecole non exposee',
    ville: e.ville || '',
    score: e.score_credibilite ?? 0,
    gradient: GRADIENTS[hashId(e.id_etudiant) % GRADIENTS.length],
    icon: 'user',
    color: 'blue',
    description: e.biographie || e.objectif_professionnel || `Candidat detecte via ${sourceLabel}. Les informations d'identite completes necessitent une API professionnelle dediee.`,
    sources,
  }
}

export function normaliserNotif(n, index, total) {
  return {
    id: n.id_notification,
    nom: n.titre ?? '',
    message: n.message ?? '',
    time: new Date(n.date_creation).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
    color: n.est_lue ? '#a0b4ae' : '#5C8C6A',
    last: index === total - 1,
  }
}

export function normaliserRec(r) {
  const u = r.cible?.utilisateur ?? r.auteur ?? {}
  const prenom = u.prenom ?? ''
  const nom = u.nom ?? ''
  const date = new Date(r.date_creation || Date.now())
  const mois = date.toLocaleString('fr-FR', { month: 'long' })

  return {
    candidatId: r.id_etudiant,
    nom: `${prenom} ${nom}`.trim() || `Etudiant ${r.id_etudiant?.slice?.(-4) || ''}`,
    initiales: `${prenom[0] ?? '?'}${nom[0] ?? '?'}`.toUpperCase(),
    gradient: GRADIENTS[0],
    type: 'officielle',
    extrait: r.message ? (r.message.length > 60 ? `${r.message.slice(0, 60)}...` : r.message) : '',
    date: `${mois.charAt(0).toUpperCase() + mois.slice(1)} ${date.getFullYear()}`,
  }
}

export const useProfessionalStore = defineStore('professional', () => {
  const candidats = ref([])
  const recsEmises = ref([])
  const notifications = ref([])
  const favoris = ref([])
  const consultes = ref(0)
  const loading = ref({ candidats: false, notifs: false })
  const erreur = ref(null)

  const totalRecs = computed(() => recsEmises.value.length)
  const candidatsFavoris = computed(() => candidats.value.filter(c => favoris.value.includes(c.id)))
  const candidatsEnAttente = computed(() => candidats.value.filter(c => !aRecommande(c.id)).length)

  async function chargerCandidats() {
    loading.value.candidats = true
    erreur.value = null
    try {
      const data = await fetchCandidats()
      candidats.value = data.map(normaliserCandidat)
      if (candidats.value.length === 0) {
        erreur.value = "Aucun candidat exploitable avec les APIs actuelles. L'annuaire professionnel dedie est documente comme API manquante."
      }
    } catch (e) {
      candidats.value = []
      erreur.value = e.message || 'Impossible de charger les candidats avec les APIs existantes.'
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
      erreur.value = e.message || 'Impossible de charger les notifications.'
    } finally {
      loading.value.notifs = false
    }
  }

  async function envoyerRecommandation(candidat, texte, type) {
    try {
      if (!candidat?.id) {
        throw new Error('Candidat invalide')
      }

      await apiEnvoyerRecommandation(candidat.id, texte)

      const now = new Date()
      const mois = now.toLocaleString('fr-FR', { month: 'long' })
      recsEmises.value.unshift({
        candidatId: candidat.id,
        nom: candidat.nom,
        initiales: candidat.initiales,
        gradient: candidat.gradient,
        type,
        extrait: texte.length > 60 ? `${texte.slice(0, 60)}...` : texte,
        date: `${mois.charAt(0).toUpperCase() + mois.slice(1)} ${now.getFullYear()}`,
      })
      notifications.value.unshift({
        id: Date.now(),
        nom: '',
        message: `Recommandation envoyee a ${candidat.nom}`,
        time: "A l'instant",
        color: '#5C8C6A',
        last: false,
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
    candidats,
    recsEmises,
    notifications,
    favoris,
    consultes,
    loading,
    erreur,
    totalRecs,
    candidatsFavoris,
    candidatsEnAttente,
    init,
    chargerCandidats,
    chargerNotifications,
    envoyerRecommandation,
    marquerLue,
    aRecommande,
    incrementerConsultes,
    toggleFavori,
  }
})
