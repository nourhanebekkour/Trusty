import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authstore'
import {
  fetchProjetsAValider,
  validerProjet    as apiValiderProjet,
  fetchStagesAValider,
  validerStage     as apiValiderStage,
  fetchNotifications,
  marquerNotificationLue,
} from '@/services/professorservices.js'

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

// ── Helper erreur API ──────────────────────────────────────────────────────────
function getErrorMessage(e) {
  return (
    e?.response?.data?.message ||
    e?.message ||
    'Erreur inconnue'
  )
}

export function normaliserProjet(p) {
  const createur  = p.participations?.[0]
  const u         = createur?.etudiant?.utilisateur ?? {}
  const estValide = p.status_validation === 'VALIDE'
  return {
    id:          p.id_projet,
    nom:         p.titre,
    etudiant:    `${u.prenom ?? ''} ${u.nom ?? ''}`.trim() || 'Étudiant',
    context:     p.type_projet ?? 'Projet académique',
    date:        p.date_soumission
                   ? `Soumis le ${new Date(p.date_soumission).toLocaleDateString('fr-FR')}`
                   : '',
    description: p.description ?? '',
    icon:        'device-laptop',
    color:       estValide ? 'teal' : 'blue',
    progress:    estValide ? 100 : 50,
    statusColor: estValide ? '#66c99f' : '#f4b94b',
    status:      estValide ? 'valide' : 'pending',
    statusLabel: estValide ? 'Validé' : 'En attente',
  }
}

export function normaliserStage(s) {
  const u         = s.etudiant?.utilisateur ?? {}
  const estValide = s.status_validation === 'VALIDE'
  return {
    id:          s.id_stage,
    entreprise:  s.entreprise,
    etudiant:    `${u.prenom ?? ''} ${u.nom ?? ''}`.trim() || 'Étudiant',
    role:        s.poste,
    dates:       `${new Date(s.date_debut).toLocaleDateString('fr-FR')}${s.date_fin ? ' – ' + new Date(s.date_fin).toLocaleDateString('fr-FR') : ''}`,
    progress:    estValide ? 100 : 30,
    color:       estValide ? '#66c99f' : '#f4b94b',
    status:      estValide ? 'valide' : 'pending',
    statusLabel: estValide ? 'Validé' : 'Attente rapport',
    note:        s.commentaire_validation ?? s.missions?.slice(0, 60) ?? '',
  }
}

export function normaliserEtudiant(e) {
  const u      = e.utilisateur ?? {}
  const prenom = u.prenom ?? ''
  const nom    = u.nom    ?? ''
  return {
    id:        e.id_etudiant,
    nom:       `${prenom} ${nom}`.trim(),
    initiales: `${prenom[0] ?? '?'}${nom[0] ?? '?'}`.toUpperCase(),
    formation: e.filiere ?? '',
    score:     e.score_credibilite ?? 0,
    gradient:  GRADIENTS[hashId(e.id_etudiant) % GRADIENTS.length],
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

// ── Store ──────────────────────────────────────────────────────────────────────

export const useProfessorStore = defineStore('professor', () => {

  const auth = useAuthStore()

  // ── Guard rôle (sans navigation) ───────────────────────────────────────────
  function isProfessor() {
    return auth.user?.role === 'PROFESSEUR'
  }

  // ── État
  const projets            = ref([])
  const stages             = ref([])
  const etudiants          = ref([])
  const notifications      = ref([])
  const lettres            = ref([])
  const loading            = ref({ projets: false, stages: false, notifs: false })
  const erreur             = ref(null)
  const validatingProjet   = ref(false)
  const validatingStage    = ref(false)

  const _etudiantsRaw = new Map()

  // ── Getters
  const enAttente       = computed(() => projets.value.filter(p => p.status === 'pending').length)
  const valides         = computed(() => projets.value.filter(p => p.status === 'valide').length)
  const etudiantsSuivis = computed(() => etudiants.value.length)
  const stagesEnCours   = computed(() => stages.value.length)

  // ── Actions API

  function _syncEtudiants() {
    etudiants.value = [..._etudiantsRaw.values()].map(normaliserEtudiant)
  }

  async function chargerProjets() {
    if (!isProfessor()) {
      erreur.value = 'Accès refusé'
      return
    }
    loading.value.projets = true
    erreur.value = null
    try {
      const data = await fetchProjetsAValider()
      projets.value = data.map(normaliserProjet)
      data.forEach(p =>
        (p.participations ?? []).forEach(({ etudiant: e }) => {
          if (e?.id_etudiant) _etudiantsRaw.set(e.id_etudiant, e)
        })
      )
      _syncEtudiants()
    } catch (e) {
      erreur.value = getErrorMessage(e)
    } finally {
      loading.value.projets = false
    }
  }

  async function chargerStages() {
    if (!isProfessor()) {
      erreur.value = 'Accès refusé'
      return
    }
    loading.value.stages = true
    try {
      const data = await fetchStagesAValider()
      stages.value = data.map(normaliserStage)
      data.forEach(s => {
        const e = s.etudiant
        if (e?.id_etudiant) _etudiantsRaw.set(e.id_etudiant, e)
      })
      _syncEtudiants()
    } catch (e) {
      erreur.value = getErrorMessage(e)
    } finally {
      loading.value.stages = false
    }
  }

  async function chargerNotifications() {
    if (!isProfessor()) {
      erreur.value = 'Accès refusé'
      return
    }
    loading.value.notifs = true
    try {
      const data = await fetchNotifications()
      notifications.value = data.map((n, i) => normaliserNotif(n, i, data.length))
    } catch (e) {
      erreur.value = getErrorMessage(e)
    } finally {
      loading.value.notifs = false
    }
  }

  async function validerProjet(projet, decision = 'VALIDE', commentaire = '', appreciation = '') {
    if (!isProfessor()) {
      throw new Error('Accès refusé')
    }

    if (validatingProjet.value) return

    if (!projet?.id) {
      throw new Error('Projet invalide')
    }

    validatingProjet.value = true
    try {
      await apiValiderProjet(projet.id, decision, commentaire, appreciation)
      const found = projets.value.find(p => p.id === projet.id)
      if (found) {
        found.status      = decision === 'VALIDE' ? 'valide' : 'refus'
        found.statusLabel = decision === 'VALIDE' ? 'Validé' : 'Rejeté'
        found.progress    = 100
        found.statusColor = decision === 'VALIDE' ? '#66c99f' : '#e57373'
      }
    } catch (e) {
      erreur.value = getErrorMessage(e)
      throw e
    } finally {
      validatingProjet.value = false
    }
  }

  async function validerStage(stage, decision = 'VALIDE', commentaire = '') {
    if (!isProfessor()) {
      throw new Error('Accès refusé')
    }

    if (validatingStage.value) return

    if (!stage?.id) {
      throw new Error('Stage invalide')
    }

    validatingStage.value = true
    try {
      await apiValiderStage(stage.id, decision, commentaire)
      const found = stages.value.find(s => s.id === stage.id)
      if (found) {
        found.status      = decision === 'VALIDE' ? 'valide' : 'refus'
        found.statusLabel = decision === 'VALIDE' ? 'Validé' : 'Rejeté'
        found.progress    = 100
        found.color       = decision === 'VALIDE' ? '#66c99f' : '#e57373'
      }
    } catch (e) {
      erreur.value = getErrorMessage(e)
      throw e
    } finally {
      validatingStage.value = false
    }
  }

  async function marquerLue(id) {
    if (!isProfessor()) return
    try {
      await marquerNotificationLue(id)
      const notif = notifications.value.find(n => n.id === id)
      if (notif) notif.color = '#a0b4ae'
    } catch (e) {
      erreur.value = getErrorMessage(e)
    }
  }

  async function init() {
    if (!isProfessor()) return
    await Promise.all([
      chargerProjets(),
      chargerStages(),
      chargerNotifications(),
    ])
  }

  return {
    projets, stages, etudiants, lettres, notifications, loading, erreur,
    validatingProjet, validatingStage,
    enAttente, valides, etudiantsSuivis, stagesEnCours,
    init, chargerProjets, chargerStages, chargerNotifications,
    validerProjet, validerStage, marquerLue,
  }
})
