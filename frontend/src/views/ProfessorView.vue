<template>
  <div class="professor-page">

    <!-- Topbar -->
    <ProfessorTopbar />

    <!-- Stats -->
    <ProfessorStats
      :en-attente="store.enAttente"
      :valides="store.valides"
      :etudiants-suivis="store.etudiantsSuivis"
      :stages-en-cours="store.stagesEnCours"
    />

    <!-- Colonnes -->
    <div class="columns">
      <!-- Gauche -->
      <div class="left-col">
        <ProfessorProjects
          :projets="store.projets"
          @valider="store.validerProjet"
        />
        <ProfessorLetters
          :lettres="store.lettres"
          @action="handleLettreAction"
        />
      </div>

      <!-- Droite -->
      <div class="right-col">
        <ProfessorStudents    :etudiants="store.etudiants" />
        <ProfessorInternships :stages="store.stages" />
        <ProfessorNotifications :notifications="store.notifications" />
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useProfessorStore } from '@/stores/professorStore'

import ProfessorTopbar        from '@/components/professor/ProfessorTopbar.vue'
import ProfessorStats         from '@/components/professor/ProfessorStats.vue'
import ProfessorProjects      from '@/components/professor/ProfessorProjects.vue'
import ProfessorLetters       from '@/components/professor/ProfessorLetters.vue'
import ProfessorStudents      from '@/components/professor/ProfessorStudents.vue'
import ProfessorInternships   from '@/components/professor/ProfessorInternships.vue'
import ProfessorNotifications from '@/components/professor/ProfessorNotifications.vue'

import '@/assets/professor.css'

const store = useProfessorStore()

onMounted(() => store.init())

function handleLettreAction(lettre) {
  console.log('Action lettre :', lettre.action, lettre.etudiant)
}
</script>
