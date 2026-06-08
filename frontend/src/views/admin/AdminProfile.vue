<template>
  <div class="page">
    <div class="page__header">
      <div>
        <h1 class="page__title">Mon Profil</h1>
        <p class="page__subtitle">Informations personnelles de votre compte administrateur.</p>
      </div>
      <div class="page__actions">
        <button class="btn btn--primary" :disabled="saving" @click="save">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
      </div>
    </div>

    <div v-if="message" :class="['msg', messageType === 'error' ? 'msg--error' : 'msg--ok']">{{ message }}</div>

    <div class="card" v-if="auth.user">
      <div class="card__header">
        <h2 class="card__title">Informations</h2>
      </div>
      <div class="form-grid">
        <div class="field">
          <label>Prénom</label>
          <input v-model="form.prenom" type="text" maxlength="50" />
        </div>
        <div class="field">
          <label>Nom</label>
          <input v-model="form.nom" type="text" maxlength="50" />
        </div>
        <div class="field">
          <label>Email</label>
          <input v-model="form.email" type="email" maxlength="100" />
        </div>
        <div class="field">
          <label>Téléphone</label>
          <input v-model="form.telephone" type="tel" maxlength="20" />
        </div>
      </div>
    </div>

    <div class="card" style="margin-top: 16px;">
      <div class="card__header">
        <h2 class="card__title">Rôle & Statut</h2>
      </div>
      <div class="info-grid">
        <div><strong>Rôle</strong><p>{{ formatRole(auth.user?.role) }}</p></div>
        <div><strong>École</strong><p>{{ auth.user?.ecole || '—' }}</p></div>
        <div><strong>Statut</strong><p>{{ auth.user?.status_compte || 'ACTIF' }}</p></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authstore'
import api from '@/services/api'

const auth = useAuthStore()
const router = useRouter()

const form = ref({ prenom: '', nom: '', email: '', telephone: '' })
const saving = ref(false)
const message = ref('')
const messageType = ref('ok')

function formatRole(role) {
  const roles = { ETUDIANT: 'Étudiant', PROFESSEUR: 'Professeur', ADMINISTRATEUR: 'Administrateur', PROFESSIONNEL: 'Professionnel' }
  return roles[role] || role || '—'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

async function save() {
  saving.value = true
  message.value = ''
  try {
    await api.patch('/utilisateurs/profil', {
      prenom: form.value.prenom,
      nom: form.value.nom,
      email: form.value.email,
      telephone: form.value.telephone,
    })
    if (auth.user) {
      auth.user.prenom = form.value.prenom
      auth.user.nom = form.value.nom
      auth.user.email = form.value.email
      auth.user.telephone = form.value.telephone
    }
    message.value = 'Profil mis à jour'
    messageType.value = 'ok'
  } catch (e) {
    message.value = e?.response?.data?.message || 'Erreur lors de la mise à jour'
    messageType.value = 'error'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (!auth.user || auth.user.role !== 'ADMINISTRATEUR') {
    router.replace('/login')
    return
  }
  form.value = {
    prenom: auth.user.prenom || '',
    nom: auth.user.nom || '',
    email: auth.user.email || '',
    telephone: auth.user.telephone || '',
  }
})
</script>

<style scoped>
.page           { padding: 32px; }
.page__header   { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page__title    { font-size: 24px; font-weight: 700; color: var(--color-text-primary); }
.page__subtitle { font-size: 14px; color: var(--color-text-secondary); margin-top: 4px; }
.page__actions  { display: flex; gap: 12px; }

.card { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: 12px; padding: 20px; }
.card__header { margin-bottom: 16px; }
.card__title  { font-size: 16px; font-weight: 600; color: var(--color-text-primary); }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 4px; }
.field label { font-size: 13px; font-weight: 600; color: var(--color-text-secondary); }
.field input {
  padding: 10px 12px; border: 1px solid var(--color-border);
  border-radius: 8px; font-size: 13px; outline: none;
  background: var(--color-surface-alt); color: var(--color-text-primary);
}
.field input:focus { border-color: var(--color-accent); }

.info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
.info-grid strong { font-size: 13px; color: var(--color-text-tertiary); display: block; margin-bottom: 4px; }
.info-grid p { font-size: 14px; color: var(--color-text-primary); }

.msg { padding: 10px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
.msg--ok    { background: var(--color-valid-bg); color: var(--color-valid-text); border: 1px solid var(--color-valid-border); }
.msg--error { background: #fef2f2; color: var(--color-danger); border: 1px solid #fecaca; }

.btn { padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; }
.btn--primary   { background: var(--color-accent); color: #fff; }
.btn--primary:hover { background: var(--color-accent-hover); }
.btn--primary:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
