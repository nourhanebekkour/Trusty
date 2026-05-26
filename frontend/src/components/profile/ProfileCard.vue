<template>
  <div class="card profile-card">
    <div class="cover-banner"></div>
    <div class="avatar-wrapper">
      <div class="avatar" title="Changer la photo" @click="triggerAvatarInput">
        <img v-if="avatarUrl" :src="avatarUrl" :alt="fullName" />
        <span v-else>{{ getInitials(fullName) }}</span>
        <span class="online-dot"></span>
        <div class="avatar-overlay">📷</div>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style="display:none"
        @change="onFileChange"
      />
    </div>
    <div class="profile-info">
      <h2>{{ fullName }}</h2>
      <p v-if="displayRole" class="role">{{ displayRole }}</p>
      <div class="info-row">✉ {{ user.email }}</div>
      <div v-if="user.telephone" class="info-row">📞 {{ user.telephone }}</div>
      <div v-if="ville" class="info-row">📍 {{ ville }}</div>
      <div v-if="user.date_creation" class="info-row">
        📅 Inscrit en {{ formatDate(user.date_creation) }}
      </div>
      <button class="btn-outline" @click="$emit('edit')">✏️ Modifier le profil</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({ user: Object })
const emit = defineEmits(['edit', 'avatar-change'])

const fileInput = ref(null)

const fullName = computed(() =>
  `${props.user?.prenom ?? ''} ${props.user?.nom ?? ''}`.trim()
)

const avatarUrl = computed(() =>
  props.user?.avatar ?? props.user?.photo ?? null
)

const displayRole = computed(() =>
  props.user?.role ?? props.user?.specialite ?? props.user?.etudiant?.specialite ?? null
)

const ville = computed(() =>
  props.user?.ville ?? props.user?.etudiant?.ville ?? null
)

const triggerAvatarInput = () => fileInput.value?.click()

const onFileChange = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  emit('avatar-change', file)
  event.target.value = ''
}

const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).map(part => part[0]).join('').toUpperCase().slice(0, 2)

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''
</script>

<style scoped>
@import '@/assets/profile.css';

.avatar {
  cursor: pointer;
  position: relative;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  opacity: 0;
  transition: opacity .2s;
}

.avatar:hover .avatar-overlay {
  opacity: 1;
}
</style>
