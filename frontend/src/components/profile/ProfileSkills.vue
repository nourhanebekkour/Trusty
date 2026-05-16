<template>
  <div class="card">
    <div class="section-header">
      <h3>Compétences</h3>
      <button class="add-btn" @click="$emit('add')">+ Ajouter</button>
    </div>
    <div class="tags" v-if="user.etudiant?.competences?.length">
      <span class="tag" v-for="ec in user.etudiant.competences" :key="ec.competence.id_competence">
        {{ ec.competence.nom }}
      </span>
    </div>
    <p class="empty-msg" v-else>Aucune compétence ajoutée.</p>
  </div>
</template>

<script setup>
defineProps({ user: Object })
defineEmits(['add'])
</script>
<style scoped>
@import '@/assets/Profile.css';
</style>