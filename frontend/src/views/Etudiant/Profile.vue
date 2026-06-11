<template>
  <div class="profile-page">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement du profil...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>⚠️ {{ error }}</p>
      <button @click="loadProfile" class="btn-outline">Réessayer</button>
    </div>

    <template v-else-if="user">
      <div class="page-header">
        <h1>Mon Profil Étudiant</h1>
        <p class="subtitle">Gérez votre identité numérique et vos certifications professionnelles.</p>
      </div>

      <div style="background: var(--color-background-tertiary); padding: 24px;">

        <div style="display: grid; grid-template-columns: 300px 1fr; gap: 16px; margin-bottom: 16px; align-items: start;">
          <div style="height: 100%;">
            <ProfileCard  :user="user" @edit="openEditModal" @avatar-change="onAvatarChange" />
          </div>
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <ProfileSkills
              :user="user"
              @add="showSkillModal = true"
              @remove="handleRemoveSkill"
            />
            <ProfileBadges :user="user" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
          <div><ProfileStats :user="user" /></div>
          <div><ProfileRepos :user="user" /></div>
          <div><ProfileProjects :user="user" /></div>
        </div>

      </div>

      <ProfileEditModal
        v-if="showEditModal"
        :user="user"
        :saving="saving"
        @close="closeEditModal"
        @save="onSaveProfile"
      />

      <SkillModal
        v-if="showSkillModal"
        :user="user"
        @close="showSkillModal = false"
        @added="handleAddSkill"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted }  from 'vue'
import { useAuthStore }    from '@/stores/authstore'

import ProfileCard         from '@/components/profile/ProfileCard.vue'
import ProfileStats        from '@/components/profile/ProfileStats.vue'
import ProfileSkills       from '@/components/profile/ProfileSkills.vue'
import ProfileBadges       from '@/components/profile/ProfileBadges.vue'
import ProfileRepos        from '@/components/profile/ProfileRepos.vue'
import ProfileProjects     from '@/components/profile/ProfileProjects.vue'
import ProfileEditModal    from '@/components/profile/ProfileEditModal.vue'
import SkillModal          from '@/components/profile/SkillModal.vue'

import {
  getProfile,
  saveProfile,
  uploadAvatar,
  addSkill,
  removeSkill,
} from '@/services/profileservices'

const authStore      = useAuthStore()
const user           = ref(null)
const loading        = ref(false)
const error          = ref(null)
const saving         = ref(false)
const showEditModal  = ref(false)
const showSkillModal = ref(false)

// ── Chargement ────────────────────────────────────────────────────────────────

const loadProfile = async () => {
  loading.value = true
  error.value   = null
  try {
    const res      = await getProfile()
    user.value     = res.data
    authStore.user = res.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Impossible de charger le profil.'
  } finally {
    loading.value = false
  }
}

// ── Édition ───────────────────────────────────────────────────────────────────

const openEditModal  = () => { showEditModal.value = true }
const closeEditModal = () => { showEditModal.value = false }

const onSaveProfile = async (formData) => {
  saving.value = true
  try {
    const res      = await patchProfile(user.value.id_utilisateur, formData)
    user.value     = res.data
    authStore.user = res.data
    closeEditModal()
  } catch (err) {
    alert(err.response?.data?.message || 'Erreur lors de la mise à jour.')
  } finally {
    saving.value = false
  }
}

// ── Avatar ────────────────────────────────────────────────────────────────────

const onAvatarChange = async (file) => {
  try {
    const res = await uploadAvatar(user.value.id_utilisateur, file)
    const data = res.data
    // L'API retourne soit { photo } soit { utilisateur: { photo } } selon l'implémentation
    const newPhoto = data?.photo ?? data?.utilisateur?.photo ?? data?.url ?? null
    if (newPhoto) {
      user.value     = { ...user.value, photo: newPhoto }
      authStore.user = user.value
    }
  } catch (err) {
    alert(err.response?.data?.message || "Erreur lors de l'upload de la photo.")
  }
}

// ── Compétences ───────────────────────────────────────────────────────────────

const onSkillAdded = async (skillName) => {
  try {
    const res = await addSkill(skillName)
    if (!user.value.etudiant) user.value.etudiant = {}
    if (!user.value.etudiant.competences) user.value.etudiant.competences = []
    user.value.etudiant.competences.push(res.data)

    showSkillModal.value = false
  } catch (e) {
    console.error('[handleAddSkill] :', e.response?.status, e.response?.data)
    alert(e.response?.data?.message || "Impossible d'ajouter cette compétence.")
  }
}

const handleRemoveSkill = async (id_competence) => {
  const id_etudiant = user.value?.etudiant?.id_etudiant ?? user.value?.id_utilisateur
  try {
    await removeSkill(id_etudiant, id_competence)
    user.value.etudiant.competences = user.value.etudiant.competences
      .filter((ec) => ec.competence.id_competence !== id_competence)
  } catch (e) {
    console.error('[handleRemoveSkill] :', e)
    alert('Impossible de supprimer cette compétence.')
  }
}

// ── Montage ───────────────────────────────────────────────────────────────────

onMounted(loadProfile)

defineExpose({ user })
</script>

<style scoped>
@import '@/assets/profile.css';
</style>
