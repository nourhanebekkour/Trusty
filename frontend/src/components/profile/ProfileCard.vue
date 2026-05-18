<template>
  <div class="card profile-card">
    <div class="cover-banner"></div>
    <div class="avatar-wrapper">
      <div class="avatar" @click="triggerAvatarInput" title="Changer la photo">
        <img v-if="user.photo" :src="user.photo" :alt="`${user.prenom} ${user.nom}`" />
        <span v-else>{{ getInitials(`${user.prenom} ${user.nom}`) }}</span>
        <span class="online-dot"></span>
        <!-- Overlay d'upload discret -->
        <div class="avatar-overlay">📷</div>
      </div>
      <!-- Input file caché — déclenché par le clic sur l'avatar -->
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style="display:none"
        @change="onFileChange"
      />
    </div>
    <div class="profile-info">
      <h2>{{ user.prenom }} {{ user.nom }}</h2>
      <p class="role">{{ user.role }} · {{ user.etudiant?.filiere ?? '' }}</p>
      <div class="info-row">✉ {{ user.email }}</div>
      <div class="info-row" v-if="user.telephone">📞 {{ user.telephone }}</div>
      <div class="info-row" v-if="user.etudiant?.ville">📍 {{ user.etudiant.ville }}</div>
      <div class="info-row" v-if="user.date_creation">
        📅 Inscrit en {{ formatDate(user.date_creation) }}
      </div>
      <button class="btn-outline" @click="$emit('edit')">✏️ Modifier le profil</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ user: Object })
const emit = defineEmits(['edit', 'avatar-change'])

const fileInput = ref(null)

const triggerAvatarInput = () => fileInput.value?.click()

const onFileChange = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  emit('avatar-change', file)
  // Réinitialiser l'input pour permettre de re-sélectionner le même fichier
  e.target.value = ''
}

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''
</script>

<style scoped>
@import '@/assets/profile.css';

.avatar { cursor: pointer; position: relative; }
.avatar-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.35);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  opacity: 0; transition: opacity .2s;
}
.avatar:hover .avatar-overlay { opacity: 1; }
</style>