<template>
  <div class="card profile-card">
    <div class="cover-banner">
      <div class="cover-pattern"></div>
    </div>

    <div class="avatar-wrapper">
      <div class="avatar" @click="triggerAvatarInput" title="Changer la photo">
        <img v-if="user.photo" :src="user.photo" :alt="`${user.prenom} ${user.nom}`" />
        <span v-else class="initials">{{ getInitials(`${user.prenom} ${user.nom}`) }}</span>
        <div class="avatar-overlay">📷</div>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style="display:none"
        @change="onFileChange"
      />
      <!-- Badge rôle -->
      <span class="role-badge">{{ roleLabel }}</span>
    </div>

    <div class="profile-info">
      <h2>{{ user.prenom }} {{ user.nom }}</h2>
      <p class="filiere-line" v-if="user.etudiant?.filiere">
        {{ user.etudiant.filiere }}
        <span v-if="user.etudiant?.annee"> · Année {{ user.etudiant.annee }}</span>
      </p>

      <!-- Objectif professionnel -->
      <p class="objectif" v-if="user.etudiant?.objectif_professionnel">
        🎯 {{ user.etudiant.objectif_professionnel }}
      </p>

      <!-- Biographie -->
      <p class="bio" v-if="user.etudiant?.biographie">
        {{ user.etudiant.biographie }}
      </p>

      <!-- Infos de contact -->
      <div class="info-list">
        <div class="info-row"><span class="info-icon">✉</span><span>{{ user.email }}</span></div>
        <div class="info-row" v-if="user.telephone"><span class="info-icon">📞</span><span>{{ user.telephone }}</span></div>
        <div class="info-row" v-if="user.etudiant?.ville">
          <span class="info-icon">📍</span>
          <span>{{ user.etudiant.ville }}<template v-if="user.etudiant?.pays && user.etudiant.pays !== 'Maroc'">, {{ user.etudiant.pays }}</template></span>
        </div>
        <div class="info-row" v-if="user.etudiant?.numero_etudiant">
          <span class="info-icon">🎓</span><span>{{ user.etudiant.numero_etudiant }}</span>
        </div>
        <div class="info-row" v-if="user.date_creation">
          <span class="info-icon">📅</span><span>Inscrit en {{ formatDate(user.date_creation) }}</span>
        </div>
      </div>

      <!-- Liens sociaux -->
      <div class="social-links">
        <a
          v-if="user.etudiant?.linkedin_url"
          :href="user.etudiant.linkedin_url"
          target="_blank"
          rel="noopener"
          class="social-btn linkedin"
        >in LinkedIn</a>
        <a
          v-if="user.etudiant?.github_username"
          :href="`https://github.com/${user.etudiant.github_username}`"
          target="_blank"
          rel="noopener"
          class="social-btn github"
        >⚙ GitHub</a>
        <a
          v-if="user.etudiant?.site_web"
          :href="user.etudiant.site_web"
          target="_blank"
          rel="noopener"
          class="social-btn site"
        >🌐 Site web</a>
      </div>

      <!-- Visibilité profil -->
      <div class="visibility-row" v-if="user.etudiant?.visibilite_profil">
        <span class="visibility-dot" :class="visibilityClass"></span>
        <span class="visibility-label">{{ visibilityLabel }}</span>
      </div>

      <button class="btn-edit" @click="$emit('edit')">✏️ Modifier le profil</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({ user: Object })
const emit  = defineEmits(['edit', 'avatar-change'])

const fileInput = ref(null)
const triggerAvatarInput = () => fileInput.value?.click()

const onFileChange = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  emit('avatar-change', file)
  e.target.value = ''
}

const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''

const roleLabel = computed(() => ({
  ETUDIANT:       'Étudiant',
  PROFESSEUR:     'Professeur',
  ADMINISTRATEUR: 'Admin',
  PROFESSIONNEL:  'Professionnel',
}[props.user.role] ?? props.user.role))

const visibilityLabel = computed(() => ({
  PUBLIC:                 '👁 Profil public',
  PRIVE:                  '🔒 Profil privé',
  ENSEIGNANTS_UNIQUEMENT: '🏫 Enseignants uniquement',
  LIEN_PARTAGE:           '🔗 Accès par lien',
}[props.user.etudiant?.visibilite_profil] ?? ''))

const visibilityClass = computed(() => ({
  PUBLIC:                 'dot-green',
  PRIVE:                  'dot-red',
  ENSEIGNANTS_UNIQUEMENT: 'dot-blue',
  LIEN_PARTAGE:           'dot-amber',
}[props.user.etudiant?.visibilite_profil] ?? ''))
</script>

<style scoped>
@import '@/assets/profile.css';

.cover-banner {
  position: relative;
  height: 90px;
  background: linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 50%, #1a8a6e 100%);
  border-radius: 12px 12px 0 0;
  overflow: hidden;
}

.cover-pattern {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(255,255,255,0.07) 1px, transparent 1px),
    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 30px 30px, 50px 50px;
}

.avatar-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  margin-top: -38px;
  margin-bottom: 6px;
}

.avatar {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.initials {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -1px;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.38);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  opacity: 0;
  transition: opacity .2s;
}
.avatar:hover .avatar-overlay { opacity: 1; }

.role-badge {
  position: absolute;
  bottom: -6px;
  right: calc(50% - 52px);
  background: #1e3a5f;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  padding: 2px 8px;
  border-radius: 20px;
  border: 2px solid #fff;
}

.profile-info {
  padding: 14px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.profile-info h2 {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
  text-align: center;
}

.filiere-line {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #6366f1;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.objectif {
  font-size: 12px;
  color: #374151;
  background: #5C8C6A;
  border-left: 3px solid #6366f1;
  padding: 6px 10px;
  border-radius: 0 6px 6px 0;
  margin: 4px 0;
}

.bio {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
  font-style: italic;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 6px 0;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #374151;
}

.info-icon {
  width: 16px;
  text-align: center;
  flex-shrink: 0;
  font-size: 13px;
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 6px 0;
}

.social-btn {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  text-decoration: none;
  transition: opacity .15s;
}
.social-btn:hover { opacity: .8; }
.linkedin { background: #0077b5; color: #fff; }
.github   { background: #24292e; color: #fff; }
.site     { background: #e5e7eb; color: #374151; }

.visibility-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #9ca3af;
}

.visibility-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-green { background: #22c55e; }
.dot-red   { background: #ef4444; }
.dot-blue  { background: #3b82f6; }
.dot-amber { background: #f59e0b; }

.btn-edit {
  margin-top: 8px;
  width: 100%;
  padding: 9px;
  border-radius: 8px;
  border: 1.5px solid #5C8C6A;
  background: #5C8C6A;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all .15s;
}
.btn-edit:hover {
  background: #92d8a7;
  border-color: #92d8a7;
  color: #6366f1;
}
</style>