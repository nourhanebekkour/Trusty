// ─── stores/stageStore.js ──────────────────────────────────────────────────
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/authstore'
import {
  fetchStagesEtudiant,
  creerStage    as apiCreer,
  modifierStage as apiModifier,
  supprimerStage as apiSupprimer,
} from '@/services/stageService'

// ─── Helpers visuels exportés (utilisés dans les composants) ──────────────────

const LOGO_COLORS = [
  'linear-gradient(135deg,#4a7fa3,#2d5a7a)',
  'linear-gradient(135deg,#8a6db3,#5a3d8a)',
  'linear-gradient(135deg,#3a8a6a,#1a5a4a)',
  'linear-gradient(135deg,#c96a3a,#8a3a1a)',
  'linear-gradient(135deg,#6a8ac9,#3a5a99)',
  'linear-gradient(135deg,#c9a94b,#8a6a1a)',
]
const AVATAR_COLORS = ['#7aad88', '#c9a94b', '#6fb3d4', '#d47a6a', '#9a7ad4']

function hashStr(str) {
  let h = 0
  for (let i = 0; i < (str?.length || 0); i++) h += str.charCodeAt(i)
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

export function initiales(str) {
  if (!str) return '?'
  return str.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
export function logoColor(name)   { return LOGO_COLORS[hashStr(name) % LOGO_COLORS.length] }
export function avatarColor(name) { return AVATAR_COLORS[hashStr(name) % AVATAR_COLORS.length] }
export function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
export function badgeClass(status) {
  return { VALIDE: 'badge--valide', EN_ATTENTE: 'badge--attente', REJETE: 'badge--rejete' }[status] ?? 'badge--cours'
}
export function labelStatut(status) {
  return { VALIDE: 'Validé', EN_ATTENTE: 'En attente', REJETE: 'Rejeté' }[status] ?? status
}

export function formDefault() {
  return {
    entreprise: '', adresse_entreprise: '', poste: '',
    date_debut: '', date_fin: '', duree_semaines: null,
    missions: '', encadrant_professionnel: '', encadrant_academique: '',
    est_public: true,
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useStageStore = defineStore('stages', () => {
  const authStore  = useAuthStore()
  const idEtudiant = computed(() => authStore.user?.id_utilisateur ?? null)

  // ── Guard rôle (sans navigation) ───────────────────────────────────────────
  function isEtudiant() {
    return authStore.user?.role === 'ETUDIANT'
  }

  // ── Données ────────────────────────────────────────────────────────────────
  const stages  = ref([])
  const loading = ref(false)
  const error   = ref(null)
  const saving  = ref(false)

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = computed(() => ({
    total:     stages.value.length,
    valides:   stages.value.filter(s => s.status_validation === 'VALIDE').length,
    enAttente: stages.value.filter(s => s.status_validation === 'EN_ATTENTE').length,
  }))

  // ── Filtres & pagination ───────────────────────────────────────────────────
  const filterStatut = ref('')
  const filterSearch = ref('')
  const page         = ref(1)
  const perPage      = 5
  const showFilter   = ref(false)

  const stagesFiltres = computed(() =>
    stages.value.filter(s => {
      const okStatut = filterStatut.value ? s.status_validation === filterStatut.value : true
      const okSearch = filterSearch.value
        ? s.entreprise.toLowerCase().includes(filterSearch.value.toLowerCase())
        : true
      return okStatut && okSearch
    })
  )
  const totalPages    = computed(() => Math.max(1, Math.ceil(stagesFiltres.value.length / perPage)))
  const stagesPagines = computed(() => {
    const start = (page.value - 1) * perPage
    return stagesFiltres.value.slice(start, start + perPage)
  })

  watch([filterStatut, filterSearch], () => { page.value = 1 })

  // ── Toast ──────────────────────────────────────────────────────────────────
  const toast = ref({ show: false, type: 'success', message: '' })

  function showToast(message, type = 'success') {
    toast.value = { show: true, type, message }
    setTimeout(() => { toast.value.show = false }, 3200)
  }

  // ── Modal & formulaire ─────────────────────────────────────────────────────
  const modal = ref({ open: false, mode: 'create', stageId: null })
  const form  = ref(formDefault())

  function openModal(mode, stage = null) {
    if (!isEtudiant()) {
      error.value = 'Accès refusé'
      return
    }
    modal.value.mode    = mode
    modal.value.stageId = stage?.id_stage ?? null
    form.value = mode === 'edit' && stage
      ? {
          entreprise:              stage.entreprise,
          adresse_entreprise:      stage.adresse_entreprise ?? '',
          poste:                   stage.poste,
          date_debut:              stage.date_debut?.slice(0, 10) ?? '',
          date_fin:                stage.date_fin?.slice(0, 10) ?? '',
          duree_semaines:          stage.duree_semaines ?? null,
          missions:                stage.missions,
          encadrant_professionnel: stage.encadrant_professionnel ?? '',
          encadrant_academique:    stage.encadrant_academique ?? '',
          est_public:              stage.est_public ?? true,
        }
      : formDefault()
    modal.value.open = true
  }

  // ── Actions API ────────────────────────────────────────────────────────────
  async function chargerStages() {
    if (!isEtudiant()) {
      error.value = 'Accès refusé'
      return
    }
    if (!idEtudiant.value) return
    loading.value = true
    error.value   = null
    try {
      stages.value = await fetchStagesEtudiant(idEtudiant.value)
    } catch (e) {
      error.value = getErrorMessage(e)
    } finally {
      loading.value = false
    }
  }

  async function sauvegarder() {
    if (!isEtudiant()) {
      showToast('Accès refusé', 'error')
      return
    }
    if (saving.value) return

    if (!idEtudiant.value) {
      showToast('Session expirée, veuillez vous reconnecter', 'error')
      return
    }
    if (!form.value.entreprise || !form.value.poste || !form.value.date_debut || !form.value.missions) {
      showToast('Veuillez remplir les champs obligatoires (*)', 'error')
      return
    }
    saving.value = true
    try {
      if (modal.value.mode === 'create') {
        const nouveau = await apiCreer(idEtudiant.value, form.value)
        stages.value.unshift(nouveau)
        showToast('Stage créé avec succès !')
      } else {
        const mis = await apiModifier(modal.value.stageId, form.value)
        const idx = stages.value.findIndex(s => s.id_stage === modal.value.stageId)
        if (idx !== -1) stages.value[idx] = mis
        showToast('Stage modifié avec succès !')
      }
      modal.value.open = false
    } catch (e) {
      showToast(getErrorMessage(e), 'error')
    } finally {
      saving.value = false
    }
  }

  async function confirmerSuppression(stage) {
    if (!isEtudiant()) {
      showToast('Accès refusé', 'error')
      return
    }
    if (!confirm(`Supprimer le stage chez "${stage.entreprise}" ?`)) return
    try {
      await apiSupprimer(stage.id_stage)
      stages.value = stages.value.filter(s => s.id_stage !== stage.id_stage)
      showToast('Stage supprimé.')
    } catch (e) {
      showToast(getErrorMessage(e), 'error')
    }
  }

  async function init() {
    if (!authStore.user) await authStore.fetchUser()
    if (!isEtudiant()) return
    await chargerStages()
  }

  return {
    // données
    stages, loading, error, saving, stats,
    // filtres & pagination
    filterStatut, filterSearch, page, showFilter,
    stagesFiltres, stagesPagines, totalPages,
    // toast
    toast, showToast,
    // modal & form
    modal, form, openModal,
    // actions
    init, chargerStages, sauvegarder, confirmerSuppression,
  }
})