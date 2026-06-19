<template>
  <div class="stages-page" @keydown.esc="handleEscape">

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
        </div>
        <div>
          <h1 class="page-title">Gestion des stages</h1>
          <p class="page-subtitle">Suivez vos expériences professionnelles et gérez vos demandes de validation</p>
        </div>
      </div>
      <button class="add-btn" @click="openNewModal" :disabled="actionLocked">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nouveau stage
      </button>
    </div>

    <!-- Stats -->
    <StageStats :stats="store.stats" />

    <!-- Liste des expériences -->
    <StageTable @voir="voirStage" @edit="openEditModal" @delete="confirmDeleteStage" />

    <!-- Grille inférieure -->
    <StageBottomGrid @download="downloadResource" />

    <!-- Modal création / édition -->
    <StageModal
      v-model="showModal"
      :edit-mode="editMode"
      :view-mode="viewMode"
      :initial-form="form"
      :etudiant-id="etudiantId"
      :stage-id="editStageId"
      @created="handleCreated"
      @updated="handleUpdated"
    />

    <!-- Modal détail (lecture seule) -->
    <StageDetailModal
      v-model="showDetailModal"
      :stage-id="detailStageId"
      @edit="openEditModal"
    />

    <!-- Confirmation suppression -->
    <ConfirmModal
      v-model="showConfirm"
      title="Supprimer ce stage ?"
      :message="deleteMessage"
      confirm-text="Oui, supprimer"
      @confirm="handleDeleteConfirmed"
    />

    <!-- Toast -->
    <Teleport to="body">
      <div
        v-if="store.toast.show"
        class="toast"
        :class="'toast--' + store.toast.type"
        role="status"
        aria-live="polite"
      >
        {{ store.toast.message }}
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStageStore } from '@/stores/stageStore'
import { useAuthStore } from '@/stores/authstore'
import { emptyForm } from '@/components/stages/stageHelpers'
import { supprimerStage } from '@/services/stageService'

import StageStats        from '@/components/stages/StageStats.vue'
import StageTable        from '@/components/stages/StageTable.vue'
import StageModal        from '@/components/stages/StageModal.vue'
import StageDetailModal  from '@/components/stages/StageDetailModal.vue'
import ConfirmModal      from '@/components/stages/ConfirmModal.vue'
import StageBottomGrid   from '@/components/stages/StageBottomGrid.vue'

const store      = useStageStore()
const authStore  = useAuthStore()

const showModal       = ref(false)
const editMode        = ref(false)
const viewMode        = ref(false)
const form            = ref(emptyForm())
const editStageId     = ref(null)

const showDetailModal = ref(false)
const detailStageId   = ref(null)

const showConfirm     = ref(false)
const stageToDelete   = ref(null)
const deleteLoading   = ref(false)

/**
 * Verrou global : empêche d'ouvrir plusieurs modals simultanément
 * ou de déclencher des actions pendant qu'une opération est en cours.
 */
const actionLocked = ref(false)

/**
 * Message de confirmation de suppression construit à partir de données
 * dont les balises HTML sont retirées avant affichage.
 */
const deleteMessage = computed(() => {
  const entreprise = sanitizeText(stageToDelete.value?.entreprise || '')
  return `Le stage chez « ${entreprise} » sera définitivement supprimé. Cette action est irréversible.`
})

const etudiantId = computed(() => authStore.user?.id_utilisateur ?? null)

/**
 * Supprime les balises HTML d'une valeur avant affichage ou envoi.
 */
function sanitizeText(value) {
  if (!value) return ''
  return String(value).replace(/<[^>]*>/g, '').trim().slice(0, 500)
}

/**
 * Nettoie les champs texte libres d'un objet stage avant de
 * peupler le formulaire d'édition.
 */
function sanitizeStageForm(stage) {
  return {
    entreprise:              sanitizeText(stage.entreprise ?? ''),
    poste:                   sanitizeText(stage.poste ?? ''),
    adresse_entreprise:      sanitizeText(stage.adresse_entreprise ?? ''),
    date_debut:              stage.date_debut?.slice(0, 10) ?? '',
    date_fin:                stage.date_fin?.slice(0, 10) ?? '',
    duree_semaines:          stage.duree_semaines ?? null,
    missions:                sanitizeText(stage.missions ?? ''),
    encadrant_professionnel: sanitizeText(stage.encadrant_professionnel ?? ''),
    encadrant_academique:    sanitizeText(stage.encadrant_academique ?? ''),
    id_validateur:           stage.id_validateur ?? null,
    est_public:              stage.est_public ?? true,
    technologies:            (stage.technologies ?? []).map(t => ({
      id_technologie:     t.id_technologie,
      nom:                sanitizeText(t.nom ?? t.technologie?.nom ?? ''),
      categorie:          sanitizeText(t.categorie ?? t.technologie?.categorie ?? ''),
      sous_categorie:     sanitizeText(t.sous_categorie ?? t.technologie?.sous_categorie ?? ''),
      version:            sanitizeText(t.version ?? ''),
      niveau_utilisation: t.niveau_utilisation ?? 'INTERMEDIAIRE',
    })),
  }
}

/**
 * Ferme la modal ou le dialogue ouvert lors d'un appui sur Escape.
 */
function handleEscape() {
  if (showConfirm.value) {
    showConfirm.value = false
  } else if (showDetailModal.value) {
    showDetailModal.value = false
  } else if (showModal.value) {
    showModal.value = false
  }
}

function openNewModal() {
  if (actionLocked.value) return
  editMode.value    = false
  viewMode.value    = false
  editStageId.value = null
  form.value        = emptyForm()
  showModal.value   = true
}

function openEditModal(stage) {
  if (actionLocked.value) return
  editMode.value    = true
  viewMode.value    = false
  editStageId.value = stage.id_stage
  form.value        = sanitizeStageForm(stage)
  showModal.value   = true
}

function handleCreated(stageId) {
  store.showToast('Stage créé avec succès !')
  store.chargerStages()
}

function handleUpdated(stageId) {
  store.showToast('Stage modifié avec succès !')
  store.chargerStages()
}

function voirStage(stage) {
  if (actionLocked.value) return
  detailStageId.value   = stage.id_stage
  showDetailModal.value = true
}

function confirmDeleteStage(stage) {
  if (actionLocked.value) return
  stageToDelete.value = stage
  showConfirm.value   = true
}

async function handleDeleteConfirmed() {
  const stage = stageToDelete.value
  if (!stage) return
  if (deleteLoading.value) return
  deleteLoading.value = true
  actionLocked.value  = true
  try {
    await supprimerStage(stage.id_stage)
    store.chargerStages()
    store.showToast('Stage supprimé.')
  } catch (e) {
    store.showToast(e?.response?.data?.message || e.message, 'error')
  } finally {
    deleteLoading.value = false
    actionLocked.value  = false
    stageToDelete.value = null
  }
}

function downloadResource(type) {
  store.showToast(`Téléchargement de "${sanitizeText(type)}" en cours...`)
}

onMounted(() => store.init())

onUnmounted(() => {
  actionLocked.value = false
})
</script>

<style scoped>
.stages-page {
  max-width: 100%;
  margin: 0;
  padding: 2rem 1.5rem;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.75rem;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.header-icon {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  background: var(--color-accent-light);
  border: 1px solid var(--color-accent-border);
  border-radius: 10px;
  color: var(--color-accent);
  flex-shrink: 0;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 0.15rem;
  letter-spacing: -0.01em;
}

.page-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1.1rem;
  background: var(--color-accent);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  flex-shrink: 0;
}

.add-btn:hover:not(:disabled) {
  background: var(--color-accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(61, 107, 94, 0.3);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  animation: fadeUp 0.25s ease;
  z-index: 2000;
  box-shadow: 0 6px 24px rgba(15, 27, 45, 0.15);
}
.toast--success { background: var(--color-accent); color: #fff; }
.toast--error   { background: var(--color-danger); color: #fff; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .stages-page { padding: 1.25rem 1rem 3rem; }
  .page-header { flex-direction: column; }
  .page-title { font-size: 1.35rem; }
  .add-btn { width: 100%; justify-content: center; }
}
</style>