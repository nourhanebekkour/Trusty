import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchProjetsAValider,
  validerProjet   as apiValiderProjet,
  fetchStagesAValider,
  validerStage    as apiValiderStage,
  fetchEtudiants,
  fetchNotifications,
} from '@/services/professorservices.js'

export const useProfessorStore = defineStore('professor', () => {

  // ── État
  const projets       = ref([])
  const stages        = ref([])
  const etudiants     = ref([])
  const notifications = ref([])
  const lettres       = ref([])
  const loading       = ref({ projets: false, stages: false, etudiants: false, notifs: false })
  const erreur        = ref(null)

  // ── Getters
  const enAttente       = computed(() => projets.value.filter(p => p.status === 'pending').length)
  const valides         = computed(() => projets.value.filter(p => p.status === 'valide').length)
  const etudiantsSuivis = computed(() => etudiants.value.length)
  const stagesEnCours   = computed(() => stages.value.length)

  // ── Normalisation

  function normaliserProjet(p) {
    const createur = p.participations?.[0]
    const u = createur?.etudiant?.utilisateur ?? {}
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

  function normaliserStage(s) {
    const u = s.etudiant?.utilisateur ?? {}
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

  function normaliserEtudiant(e) {
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
    return {
      id:        e.id_etudiant,
      nom:       `${prenom} ${nom}`.trim(),
      initiales,
      formation: e.filiere ?? '',
      score:     e.score_credibilite ?? 0,
      gradient:  couleurs[e.id_etudiant.charCodeAt(0) % couleurs.length],
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

  async function chargerProjets() {
    loading.value.projets = true
    erreur.value = null
    try {
      const data = await fetchProjetsAValider()
      projets.value = data.map(normaliserProjet)
    } catch (e) {
      erreur.value = e.message
    } finally {
      loading.value.projets = false
    }
  }

  async function chargerStages() {
    loading.value.stages = true
    try {
      const data = await fetchStagesAValider()
      stages.value = data.map(normaliserStage)
    } catch (e) {
      erreur.value = e.message
    } finally {
      loading.value.stages = false
    }
  }

  async function chargerEtudiants() {
    loading.value.etudiants = true
    try {
      const data = await fetchEtudiants()
      etudiants.value = data.map(normaliserEtudiant)
    } catch (e) {
      erreur.value = e.message
    } finally {
      loading.value.etudiants = false
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

  async function validerProjet(projet, decision = 'VALIDE', commentaire = '', appreciation = '') {
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
      erreur.value = e.message
      throw e
    }
  }

  async function validerStage(stage, decision = 'VALIDE', commentaire = '') {
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
      erreur.value = e.message
      throw e
    }
  }

  async function init() {
    await Promise.all([
      chargerProjets(),
      chargerStages(),
      chargerEtudiants(),
      chargerNotifications(),
    ])
  }

  return {
    projets, stages, etudiants, lettres, notifications, loading, erreur,
    enAttente, valides, etudiantsSuivis, stagesEnCours,
    init,
    chargerProjets, chargerStages, chargerEtudiants, chargerNotifications,
    validerProjet, validerStage,
  }
})