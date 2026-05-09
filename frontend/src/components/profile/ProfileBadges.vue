<template>
  <div class="card">
    <div class="section-header"><h3>Badges Certifiés</h3></div>
    <div class="badges-grid" v-if="user.etudiant?.badges?.length">
      <div class="badge-card" v-for="eb in user.etudiant.badges" :key="eb.badge.id_badge">
        <div class="badge-icon" :style="{ background: '#EEEDFE' }">
          <span>{{ eb.badge.icone ?? '🏅' }}</span>
        </div>
        <div>
          <p class="badge-title">{{ eb.badge.nom }}</p>
          <p class="badge-year">{{ new Date(eb.date_attribution).getFullYear() }}</p>
        </div>
      </div>
    </div>
    <p class="empty-msg" v-else>Aucun badge certifié.</p>
    <div class="generate-box">
      <div class="gen-icon">✨</div>
      <h4>Générer mon portfolio</h4>
      <p>Créez un portfolio professionnel certifié à partir de vos projets et badges validés.</p>
      <button class="btn-primary" @click="$router.push('/portfolio')">🔗 Lancer la génération</button>
    </div>
  </div>
</template>

<script setup>
defineProps({ user: Object })

</script>
<style scoped>
@import '@/assets/Profile.css';
</style>