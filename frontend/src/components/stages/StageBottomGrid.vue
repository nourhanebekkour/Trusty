<template>
  <div class="bottom-grid">

    <div class="info-card">
      <div class="info-card-title"><AppIcon name="help" /> Comment faire valider un stage ?</div>
      <ul class="info-list">
        <li>Télécharger votre convention de stage signée.</li>
        <li>Soumettre votre rapport de stage de fin de période.</li>
        <li>Demander l'évaluation de votre tuteur en entreprise via la plateforme.</li>
        <li>Attendre la validation finale de votre professeur référent.</li>
      </ul>
    </div>

    <div class="info-card">
      <div class="info-card-title"><AppIcon name="paperclip" /> Ressources UTILES</div>
      <div class="resources">
        <div class="resource-item" @click="$emit('download', 'guide')">
          <div class="resource-icon resource-icon--pdf"><AppIcon name="file-text" /></div>
          <div>
            <div class="resource-name">Guide des Stages</div>
            <div class="resource-meta">PDF · 2.4 Mo</div>
          </div>
          <div class="resource-action"><AppIcon name="download" /></div>
        </div>
        <div class="resource-item" @click="$emit('download', 'modele')">
          <div class="resource-icon resource-icon--doc"><AppIcon name="file-text" /></div>
          <div>
            <div class="resource-name">Modèle Rapport</div>
            <div class="resource-meta">DOCX · 1.1 Mo</div>
          </div>
          <div class="resource-action"><AppIcon name="plus" /></div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
defineEmits(['download'])
</script>

<style scoped>
@import '@/assets/StageList.css';
</style>
