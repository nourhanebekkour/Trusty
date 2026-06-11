<template>
  <div class="page">
    <div class="page__header">
      <div>
        <h1 class="page__title">Badges & Certifications</h1>
        <p class="page__subtitle">Gérez les badges attribués aux étudiants et l'historique des certifications.</p>
      </div>
      <div class="page__actions">
        <button class="btn btn--primary" @click="showModal = true">+ Créer un badge</button>
      </div>
    </div>

    <div v-if="admin.error" class="error-banner">{{ admin.error }}</div>
    <div v-if="successMsg" class="msg msg--ok">{{ successMsg }}</div>

    <div class="stats-row">
      <StatCard label="Certifications" :value="admin.loading ? '…' : String(admin.certHistory.length)">
        <template #icon>🏅</template>
      </StatCard>
      <StatCard label="Étudiants certifiés" :value="admin.loading ? '…' : String(certifiedStudents)">
        <template #icon>✅</template>
      </StatCard>
    </div>

    <div class="card">
      <div class="card__header">
        <h2 class="card__title">Historique des certifications</h2>
        <p class="card__subtitle">Dernières actions de certification sur la plateforme.</p>
      </div>

      <div v-if="admin.loading" class="state-msg">Chargement…</div>

      <table v-else class="table">
        <thead>
          <tr>
            <th>Action</th>
            <th>Utilisateur</th>
            <th>Date</th>
            <th>Détail</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in admin.certHistory" :key="c.id_historique || c.id">
            <td class="text-muted">{{ c.action || c.type_action || '—' }}</td>
            <td>{{ c.utilisateur?.prenom || c.prenom || '' }} {{ c.utilisateur?.nom || c.nom || '' }}</td>
            <td class="text-muted">{{ formatDate(c.date_action || c.date_creation) }}</td>
            <td class="text-muted">{{ c.description || c.detail || '—' }}</td>
          </tr>
          <tr v-if="!admin.loading && admin.certHistory.length === 0">
            <td colspan="4" class="state-msg">Aucun historique disponible</td>
          </tr>
        </tbody>
      </table>
    </div>

    <AppModal :show="showModal" title="Créer un badge" @close="showModal = false" @confirm="handleCreate">
      <div class="form-grid">
        <div class="field">
          <label>Étudiant <span class="required">*</span></label>
          <select v-model="form.id_etudiant">
            <option value="" disabled>Sélectionner un étudiant</option>
            <option v-for="s in students" :key="s.id_etudiant || s.id_utilisateur" :value="s.id_etudiant || s.id_utilisateur">
              {{ s.prenom || s.utilisateur?.prenom }} {{ s.nom || s.utilisateur?.nom }}
            </option>
          </select>
        </div>
        <div class="field">
          <label>Nom du badge <span class="required">*</span></label>
          <input v-model="form.nom" type="text" placeholder="Ex: Portfolio Certifié" maxlength="100" />
        </div>
        <div class="field" style="grid-column: span 2;">
          <label>Description</label>
          <textarea v-model="form.description" placeholder="Description optionnelle du badge" maxlength="500" rows="3"></textarea>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import StatCard from '../../components/ui/StatCard.vue'
import AppModal from '../../components/ui/AppModal.vue'
import { useAdminStore } from '../../stores/adminStore'
import { useAuthStore } from '../../stores/authstore'
import api from '@/services/api'

const admin = useAdminStore()
const authStore = useAuthStore()
const router = useRouter()

const showModal = ref(false)
const successMsg = ref('')
const students = ref([])

const form = ref({ id_etudiant: '', nom: '', description: '' })

const certifiedStudents = computed(() =>
  (admin.certHistory || []).filter(c =>
    (c.action || c.type_action || '').toUpperCase().includes('CERTIF')
  ).length
)

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

async function handleCreate() {
  if (!form.value.id_etudiant || !form.value.nom) return
  try {
    await api.post('/badges', {
      id_etudiant: form.value.id_etudiant,
      nom: form.value.nom,
      description: form.value.description,
    })
    showModal.value = false
    successMsg.value = 'Badge créé avec succès'
    form.value = { id_etudiant: '', nom: '', description: '' }
    await admin.fetchCertHistory()
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (e) {
    admin.error = e?.response?.data?.message || 'Erreur lors de la création'
  }
}

onMounted(async () => {
  if (!authStore.user || authStore.user.role !== 'ADMINISTRATEUR') {
    router.replace('/login')
    return
  }
  await Promise.all([
    admin.fetchCertHistory(),
    admin.fetchStudents(),
  ])
  students.value = admin.students
})
</script>

<style scoped>
.page           { padding: 32px; }
.page__header   { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page__title    { font-size: 24px; font-weight: 700; color: var(--color-text-primary); }
.page__subtitle { font-size: 14px; color: var(--color-text-secondary); margin-top: 4px; }
.page__actions  { display: flex; gap: 12px; }

.stats-row { display: flex; gap: 16px; margin-bottom: 20px; }

.card { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: 12px; padding: 20px; }
.card__header   { margin-bottom: 16px; }
.card__title    { font-size: 16px; font-weight: 600; color: var(--color-text-primary); }
.card__subtitle { font-size: 13px; color: var(--color-text-secondary); margin-top: 2px; }

.table { width: 100%; border-collapse: collapse; font-size: 13px; }
.table th {
  text-align: left; padding: 10px;
  font-size: 12px; font-weight: 600; color: var(--color-text-tertiary);
  text-transform: uppercase; border-bottom: 2px solid var(--color-border-light);
}
.table td { padding: 12px 10px; border-bottom: 1px solid var(--color-border-light); color: var(--color-text-primary); }
.table tr:hover td { background: var(--color-surface-hover); }

.text-muted { color: var(--color-text-tertiary); }
.state-msg { text-align: center; padding: 24px; color: var(--color-text-tertiary); font-size: 13px; }

.error-banner {
  background: #fef2f2; border: 1px solid #fecaca;
  color: var(--color-danger); padding: 10px 16px;
  border-radius: 8px; font-size: 13px; margin-bottom: 20px;
}

.msg { padding: 10px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
.msg--ok { background: var(--color-valid-bg); color: var(--color-valid-text); border: 1px solid var(--color-valid-border); }

.btn { padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; }
.btn--primary   { background: var(--color-accent); color: #fff; }
.btn--primary:hover { background: var(--color-accent-hover); }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 4px; }
.field label { font-size: 13px; font-weight: 600; color: var(--color-text-secondary); }
.required { color: var(--color-danger); }
.field input, .field select, .field textarea {
  padding: 10px 12px; border: 1px solid var(--color-border);
  border-radius: 8px; font-size: 13px; outline: none;
  background: var(--color-surface-alt); color: var(--color-text-primary);
  font-family: inherit;
}
.field input:focus, .field select:focus, .field textarea:focus {
  border-color: var(--color-accent);
}
</style>
