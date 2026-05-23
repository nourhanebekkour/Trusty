<template>
  <div class="layout">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="logo">Trusty<span>.io</span></div>

      <p class="nav-label">Principal</p>
      <div class="nav-item"><i class="ti ti-layout-dashboard"></i> Tableau de bord</div>
      <div class="nav-item active"><i class="ti ti-briefcase"></i> Projets <span class="badge">3</span></div>
      <div class="nav-item"><i class="ti ti-building-factory"></i> Stages <span class="badge">2</span></div>
      <div class="nav-item"><i class="ti ti-calendar-event"></i> Activités</div>

      <p class="nav-label">Étudiants</p>
      <div class="nav-item"><i class="ti ti-users"></i> Mes étudiants</div>
      <div class="nav-item"><i class="ti ti-file-certificate"></i> Lettres de rec.</div>
      <div class="nav-item"><i class="ti ti-star"></i> Recommandations</div>

      <p class="nav-label">Gestion</p>
      <div class="nav-item"><i class="ti ti-bell"></i> Notifications <span class="badge">4</span></div>
      <div class="nav-item"><i class="ti ti-settings"></i> Paramètres</div>

      <div class="sidebar-footer">
        <div class="avatar-sm">MP</div>
        <div>
          <div class="prof-name">M. Professeur</div>
          <div class="prof-dept">Informatique</div>
        </div>
      </div>
    </aside>

    <!-- MAIN -->
    <main class="main">
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
    </main>
  </div>
</template>

<script setup>
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

function handleLettreAction(lettre) {
  // À brancher sur le service : signerLettre(lettre.id), etc.
  console.log('Action lettre :', lettre.action, lettre.etudiant)
}
</script>
