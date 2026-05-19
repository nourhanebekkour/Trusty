<template>
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="ti ti-users"></i> Mes étudiants</div>
      <div class="card-action">Voir tous <i class="ti ti-arrow-right"></i></div>
    </div>

    <div v-for="etudiant in etudiants" :key="etudiant.id" class="student-row">
      <div class="avatar-sm" :style="{ background: etudiant.gradient }">{{ etudiant.initiales }}</div>
      <div>
        <div class="stud-name">{{ etudiant.nom }}</div>
        <div class="stud-sub">{{ etudiant.formation }}</div>
      </div>
      <div class="stud-score" :class="etudiant.score >= 80 ? 'ok' : 'warn'">
        {{ etudiant.score }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  etudiants: { type: Array, default: () => [] },
})
</script>