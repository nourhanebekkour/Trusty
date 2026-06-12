<template>
  <div class="prof-page">
    <div class="prof-page-head">
      <div>
        <h1>Mon Profil</h1>
        <p>Consultez et modifiez vos informations personnelles</p>
      </div>
      <div class="prof-actions">
        <button class="prof-btn prof-btn-secondary" @click="cancel">Annuler</button>
        <button class="prof-btn prof-btn-primary" :disabled="saving" @click="save">
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="prof-state">Chargement...</div>
    <div v-else-if="fetchError" class="prof-error">{{ fetchError }}</div>

    <template v-else-if="profile">
      <div class="prof-grid-3" style="margin-bottom: 20px">
        <section class="prof-card">
          <div class="prof-card-title">Avatar</div>
          <div style="display: flex; align-items: center; gap: 16px; margin-top: 8px">
            <div
              class="profile-avatar"
              :style="{ backgroundImage: `url(${previewUrl || profile.utilisateur?.photo_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }"
            >
              <span v-if="!previewUrl && !profile.utilisateur?.photo_url">{{ initials }}</span>
            </div>
            <label class="prof-btn prof-btn-secondary" style="cursor: pointer">
              Changer
              <input type="file" accept="image/*" style="display: none" @change="onFileChange" />
            </label>
          </div>
        </section>

        <section class="prof-card">
          <div class="prof-card-title">Identité</div>
          <div class="profile-field"><span class="profile-label">Email</span><span>{{ profile.utilisateur?.email || '—' }}</span></div>
          <div class="profile-field"><span class="profile-label">Établissement</span><span>{{ auth.user?.ecole || 'Établissement non renseigné' }}</span></div>
          <div class="profile-field"><span class="profile-label">Nom</span><span>{{ profile.utilisateur?.nom || '—' }}</span></div>
          <div class="profile-field"><span class="profile-label">Prénom</span><span>{{ profile.utilisateur?.prenom || '—' }}</span></div>
          <div class="profile-field"><span class="profile-label">Téléphone</span><span>{{ profile.utilisateur?.telephone || '—' }}</span></div>
        </section>

        <section class="prof-card">
          <div class="prof-card-title">Enseignement</div>
          <div class="profile-field"><span class="profile-label">Département</span><span>{{ profile.departement || '—' }}</span></div>
          <div class="profile-field"><span class="profile-label">Spécialité</span><span>{{ profile.specialite || '—' }}</span></div>
          <div class="profile-field"><span class="profile-label">Filières</span><span>{{ Array.isArray(profile.filieres_interv) ? profile.filieres_interv.join(', ') : '—' }}</span></div>
        </section>
      </div>

      <section class="prof-card" style="margin-bottom: 20px">
        <div class="prof-card-title">Modifier mes informations</div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px">
          <div>
            <label class="prof-stat-label">Département</label>
            <input v-model="form.departement" class="prof-input" style="width: 100%" placeholder="Département" />
          </div>
          <div>
            <label class="prof-stat-label">Spécialité</label>
            <input v-model="form.specialite" class="prof-input" style="width: 100%" placeholder="Spécialité" />
          </div>
        </div>

        <div style="margin-top: 16px">
          <label class="prof-stat-label">Filières d'intervention (séparées par des virgules)</label>
          <input v-model="form.filieres" class="prof-input" style="width: 100%" placeholder="ex: GL, IID, SIR" />
        </div>

        <div style="margin-top: 16px">
          <label class="prof-stat-label">Biographie</label>
          <textarea v-model="form.biographie" class="prof-textarea" placeholder="Parcours, spécialités, centres d'intérêt..." />
        </div>
      </section>

      <div v-if="saveError" class="prof-error" style="margin-bottom: 16px">{{ saveError }}</div>
    </template>

    <div v-if="toast.show" class="prof-toast">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authstore'
import '@/assets/professor-pages.css'
import {
  getProfessorProfile,
  updateProfessorProfile,
  uploadProfessorAvatar,
} from '@/services/professorApi'
import { getUploadErrorMessage, validateUploadFile } from '@/utils/fileUpload'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const fetchError = ref(null)
const saving = ref(false)
const saveError = ref(null)
const profile = ref(null)
const toast = ref({ show: false, message: '' })

const form = ref({
  departement: '',
  specialite: '',
  filieres: '',
  biographie: '',
})

const avatarFile = ref(null)
const previewUrl = ref('')

const initials = computed(() => {
  if (!profile.value) return 'P'
  const u = profile.value.utilisateur || {}
  const p = u.prenom?.[0] || ''
  const n = u.nom?.[0] || ''
  return `${p}${n}`.toUpperCase() || 'P'
})

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const fileError = validateUploadFile(file, { allowPdf: false })
  if (fileError) {
    saveError.value = fileError
    e.target.value = ''
    return
  }
  saveError.value = null
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  avatarFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

async function loadProfile() {
  loading.value = true
  fetchError.value = null
  try {
    const professorId = auth.user?.id_utilisateur
    if (!professorId) {
      fetchError.value = 'Impossible de récupérer votre profil.'
      return
    }
    const data = await getProfessorProfile(professorId)
    profile.value = data
    form.value.departement = data.departement || ''
    form.value.specialite = data.specialite || ''
    form.value.filieres = Array.isArray(data.filieres_interv) ? data.filieres_interv.join(', ') : ''
    form.value.biographie = data.biographie || ''
  } catch (err) {
    fetchError.value = err.response?.data?.message || 'Impossible de charger le profil.'
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  saveError.value = null
  try {
    const professorId = auth.user?.id_utilisateur
    if (!professorId) return

    const payload = {
      departement: form.value.departement || undefined,
      specialite: form.value.specialite || undefined,
      filieres: form.value.filieres ? form.value.filieres.split(',').map(s => s.trim()).filter(Boolean) : [],
      biographie: form.value.biographie || undefined,
    }

    await updateProfessorProfile(professorId, payload)

    if (avatarFile.value) {
      await uploadProfessorAvatar(professorId, avatarFile.value)
      avatarFile.value = null
      previewUrl.value = ''
    }

    showToast('Profil mis à jour avec succès.')
    await loadProfile()
  } catch (err) {
    saveError.value = avatarFile.value
      ? getUploadErrorMessage(err, 'Erreur lors de la sauvegarde.')
      : (err.response?.data?.message || 'Erreur lors de la sauvegarde.')
  } finally {
    saving.value = false
  }
}

function cancel() {
  router.push('/professor/dashboard')
}

function showToast(message) {
  toast.value = { show: true, message }
  setTimeout(() => { toast.value.show = false }, 3000)
}

onMounted(loadProfile)
</script>

<style scoped>
.profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--color-accent, #D6EDE8);
  color: var(--color-accent, #5C8C6A);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 800;
  flex-shrink: 0;
  border: 2px solid var(--color-border-light, #E5E0D6);
  overflow: hidden;
}

.profile-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border-light, #E5E0D6);
  font-size: 13px;
  gap: 12px;
}

.profile-field:last-child {
  border-bottom: none;
}

.profile-label {
  color: var(--color-text-secondary, #6F7F7C);
  font-weight: 600;
  flex-shrink: 0;
}
</style>
