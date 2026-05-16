<template>
  <div class="card profile-card">
    <div class="cover-banner"></div>
    <div class="avatar-wrapper">
      <div class="avatar">
        <img v-if="user.avatar" :src="user.avatar" :alt="`${user.prenom} ${user.nom}`" />
        <span v-else>{{ getInitials(`${user.prenom} ${user.nom}`) }}</span>
        <span class="online-dot"></span>
      </div>
    </div>
    <div class="profile-info">
      <h2>{{ user.prenom }} {{ user.nom }}</h2>
      <p class="role" v-if="user.role || user.specialite">{{ user.role ?? user.specialite }}</p>
      <div class="info-row">✉ {{ user.email }}</div>
      <div class="info-row" v-if="user.telephone">📞 {{ user.telephone }}</div>
      <div class="info-row" v-if="user.ville">📍 {{ user.ville }}</div>
      <div class="info-row" v-if="user.date_creation">
        📅 Inscrit en {{ formatDate(user.date_creation) }}
      </div>
      <button class="btn-outline" @click="$emit('edit')">✏️ Modifier le profil</button>
    </div>
  </div>
</template>

<script setup>
defineProps({ user: Object })
defineEmits(['edit'])

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''
</script>
<style scoped>
@import '@/assets/Profile.css';
</style>