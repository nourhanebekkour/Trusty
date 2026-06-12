<template>
  <div class="page">

    <div class="page__header">
      <div>
        <h1 class="page__title">Gestion des Utilisateurs</h1>
        <p class="page__subtitle">Administrez les comptes des étudiants et des professeurs de la plateforme.</p>
      </div>
      <div class="page__actions">
        <button class="btn btn--secondary" @click="exportUsers(filteredUsers, 'utilisateurs')">Exporter</button>
        <button class="btn btn--primary" @click="showCreateModal = true">+ Créer un utilisateur</button>
      </div>
    </div>

    <!-- Stats — calculées depuis les vraies données -->
    <div class="stats-row">
      <StatCard label="Total Utilisateurs"
                :value="admin.loading ? '…' : formatNumber(admin.users.length)">
        <template #icon></template>
      </StatCard>
      <StatCard label="Étudiants Actifs"
                :value="admin.loading ? '…' : formatNumber(activeStudentsCount)"
                sub="Portfolios générés" >
        <template #icon></template>
      </StatCard>
      <StatCard label="Professeurs"
                :value="admin.loading ? '…' : formatNumber(professorsCount)">
        <template #icon></template>
      </StatCard>
    </div>

    <!-- Erreur -->
    <div v-if="admin.error" class="error-banner"> {{ admin.error }}</div>

    <!-- Table card -->
    <div class="card">
      <div class="table-toolbar">
        <div class="search-box">
          <span class="search-box__icon"></span>
          <input v-model="searchQuery" type="text"
                 placeholder="Rechercher par nom, email..."
                 @input="currentPage = 1" />
        </div>
        <button class="btn btn--secondary btn--sm" @click="showFilters = !showFilters">Filtres</button>
      </div>
      <div v-if="showFilters" class="filter-row">
        <select v-model="roleFilter" @change="currentPage = 1">
          <option value="">Tous les rôles</option>
          <option value="ETUDIANT">Étudiants</option>
          <option value="PROFESSEUR">Professeurs</option>
        </select>
        <select v-model="statusFilter" @change="currentPage = 1">
          <option value="">Tous les statuts</option>
          <option value="ACTIF">Actifs</option>
          <option value="INACTIF">Inactifs</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="SUSPENDU">Suspendus</option>
        </select>
      </div>

      <!-- Loader -->
      <div v-if="admin.loading" class="state-msg">Chargement…</div>

      <table v-else class="table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Rôle</th>
            <th v-if="authStore.isSuperAdmin">Établissement</th>
            <th>Email</th>
            <th>Statut</th>
            <th>Date d'inscription</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in paginatedUsers" :key="user.id_utilisateur">
            <td>
              <div class="user-cell">
                <div class="avatar">{{ initials(user.prenom, user.nom) }}</div>
                <div>
                  <div class="user-cell__name">
                    {{ user.prenom }} {{ user.nom }}
                  </div>
                  <div class="user-cell__id">ID: {{ shortId(user.id_utilisateur) }}</div>
                </div>
              </div>
            </td>
            <td><StatusBadge :status="user.role || '—'" /></td>
            <td v-if="authStore.isSuperAdmin" class="text-muted">{{ user.ecole || '—' }}</td>
            <td class="text-muted">{{ user.email }}</td>
            <td>
              <span :class="['statut', isOk(user.status_compte) ? 'statut--ok' : 'statut--pending']">
                {{ formatStatus(user.status_compte) }}
              </span>
            </td>
            <td class="text-muted">{{ formatDate(user.date_creation) }}</td>
            <td>
              <div class="action-btns">
                <button class="btn btn--icon btn--sm" title="Activer/Suspendre"
                        @click="handleToggleStatus(user)">🔒</button>
                <button class="btn btn--icon btn--sm" title="Changer rôle"
                        @click="handleChangeRole(user)">🔄</button>
                <button class="btn btn--icon btn--sm" title="Supprimer"
                        @click="handleDelete(user.id_utilisateur)">🗑</button>
              </div>
            </td>
          </tr>
          <tr v-if="!admin.loading && paginatedUsers.length === 0">
            <td :colspan="authStore.isSuperAdmin ? 7 : 6" class="state-msg">Aucun utilisateur trouvé</td>
          </tr>
        </tbody>
      </table>

      <AppPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-items="filteredUsers.length"
        :per-page="perPage"
        item-label="utilisateurs"
        @page-change="currentPage = $event"
      />
    </div>

    <!-- Bottom info cards -->
    <div class="info-grid">
      <div class="info-card">
        <div class="info-card__icon"></div>
        <div>
          <strong>Vérifications Récentes</strong>
          <p>
            Il y a
            <strong>{{ admin.verificationQueue.length }}</strong>
            éléments en attente de vérification.
          </p>
          <router-link to="/admin/verifications" class="link">Accéder à la file d'attente →</router-link>
        </div>
      </div>
      <div class="info-card">
        <div class="info-card__icon"></div>
        <div>
          <strong>Rapports d'activité</strong>
          <p>Générez un rapport complet sur l'engagement des utilisateurs et les certifications.</p>
          <button class="link link--button" @click="exportMonthlyReport">Télécharger le rapport mensuel →</button>
        </div>
      </div>
    </div>

    <!-- Modal Créer un utilisateur — connecté à POST /auth/register -->
    <AppModal
      :show="showCreateModal"
      title="Créer un profil complet"
      subtitle="Saisissez les informations personnelles et configurez la sécurité initiale du compte."
      @close="closeModal"
      @confirm="handleCreateUser"
    >
      <div v-if="createError" class="error-banner" style="margin-bottom:16px">
         {{ createError }}
      </div>

      <div class="form-section">
        <div class="form-section__label"> INFORMATIONS PERSONNELLES</div>
        <div class="form-grid">
          <div class="field">
            <label>Prénom <span class="required">*</span></label>
            <input v-model="newUser.firstName" type="text" placeholder="Ex: Thomas"
                   maxlength="50"
                   :class="{ 'input--error': v$.firstName.$error }"
                   @blur="v$.firstName.$touch()" />
            <span v-if="v$.firstName.$error" class="field-error">Prénom requis</span>
          </div>
          <div class="field">
            <label>Nom <span class="required">*</span></label>
            <input v-model="newUser.lastName" type="text" placeholder="Ex: Durand"
                   maxlength="50"
                   :class="{ 'input--error': v$.lastName.$error }"
                   @blur="v$.lastName.$touch()" />
            <span v-if="v$.lastName.$error" class="field-error">Nom requis</span>
          </div>
          <div class="field">
            <label>Email professionnel <span class="required">*</span></label>
            <input v-model="newUser.email" type="email" placeholder="t.durand@exemple.com"
                   maxlength="100"
                   :class="{ 'input--error': v$.email.$error }"
                   @blur="v$.email.$touch()" />
            <span v-if="v$.email.$error" class="field-error">Email valide requis</span>
          </div>
          <div class="field">
            <label>Téléphone</label>
            <input v-model="newUser.phone" type="tel" placeholder="06 00 00 00 00" maxlength="20" />
          </div>
          <div class="field">
            <label>Rôle Plateforme <span class="required">*</span></label>
            <select v-model="newUser.role">
              <option>Étudiant</option>
              <option>Professeur</option>
              <option>Administrateur</option>
              <option>Professionnel</option>
            </select>
          </div>
          <div class="field">
            <label>Date de naissance (Optionnel)</label>
            <input v-model="newUser.birthdate" type="date" />
          </div>
        </div>
      </div>

      <div class="form-section form-section--security">
        <div class="form-section__label"> SÉCURITÉ DU COMPTE</div>
        <div class="field">
          <label>Mot de passe provisoire <span class="required">*</span></label>
          <div class="input-group">
            <input v-model="newUser.password"
                   :type="showPwd ? 'text' : 'password'"
                   placeholder="••••••••"
                   minlength="8" maxlength="128"
                   :class="{ 'input--error': v$.password.$error }"
                   @blur="v$.password.$touch()" />
            <button type="button" class="input-group__btn" @click="showPwd = !showPwd">👁</button>
            <button type="button" class="input-group__btn" @click="generatePassword">↻ Générer</button>
          </div>
          <span v-if="v$.password.$error" class="field-error">Min. 8 caractères requis</span>
        </div>
        <div class="checkbox-group">
          <label>
            <input type="checkbox" v-model="newUser.forceChange" />
            Exiger le changement de mot de passe à la première connexion
          </label>
          <label>
            <input type="checkbox" v-model="newUser.twoFactor" />
            Activer l'authentification à deux facteurs (2FA) par défaut
          </label>
        </div>
      </div>
    </AppModal>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVuelidate }  from '@vuelidate/core'
import { required, email as emailRule, minLength } from '@vuelidate/validators'
import StatCard      from '../../components/ui/StatCard.vue'
import StatusBadge   from '../../components/ui/StatusBadge.vue'
import AppPagination from '../../components/ui/AppPagination.vue'
import AppModal      from '../../components/ui/AppModal.vue'
import { useAdminStore } from '../../stores/adminStore'
import { useAuthStore }  from '../../stores/authstore'

const admin     = useAdminStore()
const authStore = useAuthStore()
const router    = useRouter()

// ── Stats calculées depuis les vraies données ─────────────
const activeStudentsCount = computed(() =>
  (admin.users || []).filter(u =>
    u.role === 'ETUDIANT' && u.status_compte === 'ACTIF'
  ).length
)

const professorsCount = computed(() =>
  (admin.users || []).filter(u =>
    u.role === 'PROFESSEUR' || u.role === 'PROFESSIONNEL'
  ).length
)

// ── Recherche + pagination ────────────────────────────────
const searchQuery = ref('')
const showFilters = ref(false)
const roleFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const perPage     = 5

const filteredUsers = computed(() =>
  (admin.users || []).filter(u => {
    const fullName = `${u.prenom || ''} ${u.nom || ''}`.toLowerCase()
    const email    = (u.email || '').toLowerCase()
    const q        = searchQuery.value.toLowerCase()
    const matchesSearch = fullName.includes(q) || email.includes(q)
    const matchesRole = !roleFilter.value || u.role === roleFilter.value
    const matchesStatus = !statusFilter.value || u.status_compte === statusFilter.value
    return matchesSearch && matchesRole && matchesStatus
  })
)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredUsers.value.length / perPage))
)

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredUsers.value.slice(start, start + perPage)
})

// ── Modal ─────────────────────────────────────────────────
const showCreateModal = ref(false)
const showPwd         = ref(false)
const createError     = ref(null)

const emptyUser = () => ({
  firstName: '', lastName: '', email: '', phone: '',
  role: 'Étudiant', birthdate: '', password: '',
  forceChange: true, twoFactor: false,
})
const newUser = ref(emptyUser())

const rules = {
  firstName: { required },
  lastName:  { required },
  email:     { required, emailRule },
  password:  { required, minLength: minLength(8) },
}
const v$ = useVuelidate(rules, newUser)

// sanitisation avant envoi ──────────────────
function sanitize(str) {
  return (str || '').trim().replace(/[<>"'`]/g, '')
}

function sanitizeUser(user) {
  return {
    ...user,
    firstName: sanitize(user.firstName),
    lastName:  sanitize(user.lastName),
    email:     sanitize(user.email),
    phone:     sanitize(user.phone),
    password:  user.password, 
  }
}

function closeModal() {
  showCreateModal.value = false
  createError.value     = null
  newUser.value         = emptyUser()
  v$.value.$reset()
}

function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'
  newUser.value.password = Array.from({ length: 12 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

async function handleCreateUser() {
  const valid = await v$.value.$validate()
  if (!valid) return

  createError.value = null

  // Ssoumettre les données sanitisées
  const result = await admin.createUser(sanitizeUser(newUser.value))

  if (result.success) {
    closeModal()
  } else {
    createError.value = result.message
  }
}

// ── Actions ──────────────────────────────────
async function handleDelete(id) {
  await admin.deleteUser(id)
}

// ── Helpers ───────────────────────────────────────────────
function formatNumber(val) {
  if (!val && val !== 0) return '—'
  return Number(val).toLocaleString('fr-FR')
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

function formatStatus(status) {
  const map = {
    ACTIF:      'Actif',
    INACTIF:    'Inactif',
    EN_ATTENTE: 'En attente',
    SUSPENDU:   'Suspendu',
  }
  return map[status] || status || '—'
}

function isOk(status) {
  return status === 'ACTIF' || status === 'VERIFIE'
}

function initials(prenom, nom) {
  const p = prenom?.[0] || ''
  const n = nom?.[0]    || ''
  return (p + n).toUpperCase() || '?'
}

function shortId(id) {
  if (!id) return '—'
  const s = String(id)
  return s.slice(0, 8)
}

async function handleToggleStatus(user) {
  const newStatus = user.status_compte === 'ACTIF' ? 'INACTIF' : 'ACTIF'
  await admin.updateUserStatus(user.id_utilisateur, newStatus)
}

async function handleChangeRole(user) {
  const roles = ['ETUDIANT', 'PROFESSEUR', 'PROFESSIONNEL', 'ADMINISTRATEUR']
  const idx = roles.indexOf(user.role)
  const nextRole = roles[(idx + 1) % roles.length]
  await admin.updateUserRole(user.id_utilisateur, nextRole)
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

function exportUsers(users, filename) {
  const header = ['Nom', 'Prénom', 'Rôle', 'Établissement', 'Email', 'Statut', 'Date inscription']
  const rows = users.map(user => [
    user.nom,
    user.prenom,
    user.role,
    user.ecole,
    user.email,
    formatStatus(user.status_compte),
    formatDate(user.date_creation),
  ])
  const csv = [header, ...rows].map(row => row.map(csvCell).join(';')).join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function exportMonthlyReport() {
  const now = new Date()
  const monthlyUsers = (admin.users || []).filter(user => {
    const createdAt = new Date(user.date_creation)
    return createdAt.getFullYear() === now.getFullYear()
      && createdAt.getMonth() === now.getMonth()
  })
  exportUsers(monthlyUsers, 'rapport-utilisateurs-mensuel')
}

// ── Chargement initial avec guard de rôle ────────────────
onMounted(async () => {
  if (!authStore.user || authStore.user.role !== 'ADMINISTRATEUR') {
    router.replace('/login')
    return
  }

  await Promise.all([
    admin.fetchUsers(),
    admin.fetchVerificationQueue(),
  ])
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

.table-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.filter-row { display: flex; gap: 10px; margin: -4px 0 16px; }
.filter-row select {
  padding: 8px 12px; border: 1px solid var(--color-border); border-radius: 8px;
  background: var(--color-surface-alt); color: var(--color-text-primary);
}
.search-box {
  display: flex; align-items: center; gap: 8px;
  border: 1px solid var(--color-border); border-radius: 8px;
  padding: 8px 12px; width: 320px;
  background: var(--color-surface-alt);
}
.search-box input { border: none; outline: none; font-size: 13px; width: 100%; color: var(--color-text-primary); background: transparent; }

.table { width: 100%; border-collapse: collapse; font-size: 13px; }
.table th {
  text-align: left; padding: 10px;
  font-size: 12px; font-weight: 600; color: var(--color-text-tertiary);
  text-transform: uppercase; border-bottom: 2px solid var(--color-border-light);
}
.table td { padding: 12px 10px; border-bottom: 1px solid var(--color-border-light); color: var(--color-text-primary); vertical-align: middle; }
.table tr:hover td { background: var(--color-surface-hover); }

.user-cell      { display: flex; align-items: center; gap: 10px; }
.user-cell__name { font-weight: 500; font-size: 13px; }
.user-cell__id   { font-size: 11px; color: var(--color-text-tertiary); }
.avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--color-accent); color: #fff;
  font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.statut          { font-size: 12px; font-weight: 500; }
.statut--ok      { color: var(--color-valid-text); }
.statut--pending { color: var(--color-waiting-text); }

.text-muted  { color: var(--color-text-tertiary); }
.action-btns { display: flex; gap: 4px; }

.state-msg { text-align: center; padding: 24px; color: var(--color-text-tertiary); font-size: 13px; }

.error-banner {
  background: #fef2f2; border: 1px solid #fecaca;
  color: var(--color-danger); padding: 10px 16px;
  border-radius: 8px; font-size: 13px; margin-bottom: 20px;
}

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px; }
.info-card {
  background: var(--color-surface); border: 1px solid var(--color-border-light);
  border-radius: 12px; padding: 20px;
  display: flex; gap: 14px; align-items: flex-start;
}
.info-card strong { font-size: 14px; color: var(--color-text-primary); display: block; margin-bottom: 4px; }
.info-card p      { font-size: 13px; color: var(--color-text-secondary); margin-bottom: 8px; }

.btn { padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; }
.btn--primary         { background: var(--color-accent); color: #fff; }
.btn--primary:hover   { background: var(--color-accent-hover); }
.btn--secondary       { background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text-secondary); }
.btn--secondary:hover { background: var(--color-surface-hover); }
.btn--sm   { padding: 6px 12px; font-size: 12px; }
.btn--icon { background: transparent; border: 1px solid var(--color-border); color: var(--color-text-tertiary); padding: 5px 9px; }
.btn--icon:hover { background: var(--color-surface-hover); }

.link { color: var(--color-accent); font-size: 13px; text-decoration: none; font-weight: 500; }
.link:hover { text-decoration: underline; }
.link--button { padding: 0; border: 0; background: none; cursor: pointer; }

.form-section { margin-bottom: 20px; }
.form-section--security {
  background: var(--color-surface-alt); border: 1px solid var(--color-border-light);
  border-radius: 10px; padding: 16px;
}
.form-section__label {
  font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
  color: var(--color-text-tertiary); text-transform: uppercase; margin-bottom: 14px;
}
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 4px; }
.field label { font-size: 13px; font-weight: 600; color: var(--color-text-secondary); }
.required    { color: var(--color-danger); }
.field-error { font-size: 11px; color: var(--color-danger); }
.field input, .field select {
  padding: 10px 12px; border: 1px solid var(--color-border);
  border-radius: 8px; font-size: 13px; outline: none;
  background: var(--color-surface-alt); color: var(--color-text-primary);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field input:focus, .field select:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-light);
}
.input--error { border-color: var(--color-danger) !important; }
.input-group  { display: flex; gap: 8px; }
.input-group input { flex: 1; }
.input-group__btn {
  padding: 8px 12px; border: 1px solid var(--color-border);
  border-radius: 8px; background: var(--color-surface);
  cursor: pointer; font-size: 12px; color: var(--color-text-secondary); white-space: nowrap;
}
.checkbox-group { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.checkbox-group label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--color-text-secondary); cursor: pointer; }
</style>
