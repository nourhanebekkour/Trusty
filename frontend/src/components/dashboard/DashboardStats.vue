<template>
  <div class="stats-grid">
    <div v-for="item in statItems" :key="item.key" class="stat-card">
      <img :src="item.icon" class="icon icon--md" alt="" />
      <div class="stat-card__content">
        <p class="stat-card__label">{{ item.label }}</p>
        <p v-if="stats" class="stat-card__value">{{ stats[item.key] }}{{ item.suffix }}</p>
        <div v-else class="skeleton skeleton--value" />
      </div>
    </div>
  </div>
</template>

<script setup>
import iconProjets         from '@/assets/icons/trusty.svg'
import iconDashboard       from '@/assets/icons/certifie.svg'
import iconProfile         from '@/assets/icons/eye.svg'
import iconRecommandations from '@/assets/icons/share.svg'

defineProps({ stats: Object })

// Clés identiques au contrat API : { projetsCertifies, credibilite, vuesProfil, recommandations }
const statItems = [
  { key: 'projetsCertifies', label: 'PROJETS CERTIFIÉS',     suffix: '',     icon: iconProjets         },
  { key: 'credibilite',      label: 'CRÉDIBILITÉ PORTFOLIO',  suffix: '/100', icon: iconDashboard       },
  { key: 'vuesProfil',       label: 'VUES PROFIL (30J)',      suffix: '',     icon: iconProfile         },
  { key: 'recommandations',  label: 'RECOMMANDATIONS',        suffix: '',     icon: iconRecommandations },
]
</script>

<style scoped>
@import '@/assets/Dashboard.css';
</style>