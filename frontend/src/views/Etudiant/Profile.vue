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

      <div class="profile-grid">
        <div class="sidebar">
          <ProfileCard  :user="user" @edit="openEditModal" @avatar-change="onAvatarChange" />
          <ProfileStats :user="user" />
        </div>
        <div class="content">
          <ProfileSkills   :user="user" @add="showSkillsModal = true" />
          <ProfileBadges   :user="user" @generate="generatePortfolio" />
          <div class="two-cols">
            <ProfileRepos    :user="user" />
            <ProfileProjects :user="user" />
          </div>
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
        v-if="showSkillsModal"
        :user="user"
        @close="showSkillsModal = false"
        @added="onSkillAdded"
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
import { getProfile, patchProfile, addSkill, uploadAvatar } from '@/services/profileservices'

const authStore       = useAuthStore()
const user            = ref(null)
const loading         = ref(false)
const error           = ref(null)
const saving          = ref(false)
const showEditModal   = ref(false)
const showSkillsModal = ref(false)

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

// ── Édition du profil ─────────────────────────────────────────────────────────

const openEditModal  = () => { showEditModal.value = true }
const closeEditModal = () => { showEditModal.value = false }

/**
 Il faut ajouter
 * saveProfile() orchestre automatiquement les deux appels :
 *   PATCH /utilisateurs/{id}  
 *   PUT   /etudiants/{id}     → ville, biographie...
 */
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

/**
 * Appelé par ProfileCard quand l'utilisateur choisit un nouveau fichier avatar.
 * @param {File} file
 */
const onAvatarChange = async (file) => {
  try {
    const res = await uploadAvatar(user.value.id_utilisateur, file)
    // Mettre à jour uniquement le champ photo pour éviter de re-fetcher tout le profil
    user.value = { ...user.value, photo: res.data.photo }
    authStore.user = user.value
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
  } catch {
    // Fallback local si l'API échoue (mode dégradé)
    if (!user.value.etudiant.competences) user.value.etudiant.competences = []
    user.value.etudiant.competences.push({
      competence:      { id_competence: Date.now().toString(), nom: skillName, type: 'TECHNIQUE' },
      niveau_maitrise: 'DEBUTANT',
    })
  }
}

// ── Portfolio ─────────────────────────────────────────────────────────────────

const generatePortfolio = () => alert('Fonctionnalité bientôt disponible !')

onMounted(loadProfile)

defineExpose({ user })
</script>

<style scoped>
@import '@/assets/profile.css';
</style>
