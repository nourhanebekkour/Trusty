<template>
  <!-- Role guard — rendu bloqué si rôle non autorisé -->
  <div v-if="!isAuthorized" class="access-denied" role="alert" aria-live="assertive">
    Access denied. You must be logged in as a professor to view this page.
  </div>

  <div v-else class="dashboard-page">

    <!-- Page header -->
    <header class="page-header">
      <div class="page-header__left">
        <div class="page-header__title">
          <h1 class="page-title">Tableau de Bord Professeur</h1>
          <img src="@/assets/icons/trusty.svg" class="icon icon--md" alt="" />
        </div>
        <p class="page-subtitle">Validez les projets et stages, suivez vos étudiants.</p>
      </div>
    </header>

    <!-- Stats -->
    <ProfessorStats
      :en-attente="store.enAttente"
      :valides="store.valides"
      :etudiants-suivis="store.etudiantsSuivis"
      :stages-en-cours="store.stagesEnCours"
    />

    <!-- Main grid -->
    <div class="content-grid">
      <div class="content-grid__main">
        <ProfessorProjects
          :projets="store.projets"
          @valider="store.validerProjet"
        />
      </div>
      <aside class="content-grid__sidebar">
        <ProfessorStudents :etudiants="store.etudiants" @select="onSelectStudent" />
        <ProfessorInternships :stages="store.stages" />
        <ProfessorNotifications :notifications="store.notifications" />
      </aside>
    </div>

    <ProfessorStudentDetail
      v-if="selectedStudent"
      :student-id="selectedStudent.id"
      :student-name="selectedStudent.name"
      @close="selectedStudent = null"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useProfessorStore } from '@/stores/professorStore'
import { useAuthStore }      from '@/stores/authstore'

import ProfessorStats         from '@/components/professor/ProfessorStats.vue'
import ProfessorProjects      from '@/components/professor/ProfessorProjects.vue'
import ProfessorStudents      from '@/components/professor/ProfessorStudents.vue'
import ProfessorInternships   from '@/components/professor/ProfessorInternships.vue'
import ProfessorNotifications from '@/components/professor/ProfessorNotifications.vue'
import ProfessorStudentDetail from '@/components/professor/ProfessorStudentDetail.vue'

const store    = useProfessorStore()
const authStore = useAuthStore()

// Role guard côté composant ──────────
const ALLOWED_ROLE = 'PROFESSEUR'

const isAuthorized = computed(() =>
  authStore.user?.role === ALLOWED_ROLE && authStore.isAuthenticated
)

// Validation de l'événement onSelectStudent ─────
const MAX_NAME_LENGTH = 120

const isValidId = (id) => {
  if (id === null || id === undefined) return false
  // Accepte uniquement des entiers positifs ou des UUID v4
  const isInt  = Number.isInteger(Number(id)) && Number(id) > 0
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id))
  return isInt || isUuid
}

const isValidName = (name) => {
  if (!name || typeof name !== 'string') return false
  const trimmed = name.trim()
  if (trimmed.length === 0 || trimmed.length > MAX_NAME_LENGTH) return false
  // Rejette tout contenu avec des balises HTML (tentative XSS)
  if (/<[^>]*>/.test(trimmed)) return false
  return true
}

const selectedStudent = ref(null)

function onSelectStudent(id, name) {
  // bloquer silencieusement toute donnée invalide
  if (!isValidId(id) || !isValidName(name)) {
    console.warn('[ProfessorView] onSelectStudent: invalid id or name received', { id, name })
    return
  }
  selectedStudent.value = { id, name }
}

// ─── Logique métier originale (inchangée) ───
onMounted(() => store.init())
</script>

<style>
@import '@/assets/dashboard.css';
@import '@/assets/professor.css';
</style>

<style scoped>
.content-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
  align-items: start;
}

.content-grid__sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (max-width: 960px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

/* Sécurité 1 : style du bloc access denied */
.access-denied {
  padding: 40px 24px;
  text-align: center;
  color: var(--color-text-danger, #a32d2d);
  font-size: 16px;
  border: 1px solid var(--color-border-danger, #f09595);
  border-radius: 8px;
  margin: 24px auto;
  max-width: 480px;
}
</style>