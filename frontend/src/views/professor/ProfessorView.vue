<template>
  <div class="dashboard-page">

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
          @details="router.push('/professor/validations')"
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
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProfessorStore } from '@/stores/professorStore'

import ProfessorStats         from '@/components/professor/ProfessorStats.vue'
import ProfessorProjects      from '@/components/professor/ProfessorProjects.vue'
import ProfessorStudents      from '@/components/professor/ProfessorStudents.vue'
import ProfessorInternships   from '@/components/professor/ProfessorInternships.vue'
import ProfessorNotifications from '@/components/professor/ProfessorNotifications.vue'
import ProfessorStudentDetail from '@/components/professor/ProfessorStudentDetail.vue'

const store = useProfessorStore()
const router = useRouter()

const selectedStudent = ref(null)

function onSelectStudent(id, name) {
  selectedStudent.value = { id, name }
}

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
</style>
