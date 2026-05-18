<template>
  <div class="page">

    <div class="page__header">
      <div>
        <h1 class="page__title">Gestion des Utilisateurs</h1>
        <p class="page__subtitle">Administrez les comptes des étudiants et des professeurs de la plateforme.</p>
      </div>
      <div class="page__actions">
        <button class="btn btn--secondary">⬇ Exporter</button>
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
        <button class="btn btn--secondary btn--sm">⚙ Filtres</button>
      </div>

      <!-- Loader -->
      <div v-if="admin.loading" class="state-msg">Chargement…</div>

      <table v-else class="table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Rôle</th>
            <th>Email</th>
            <th>Statut</th>
            <th>Date d'inscription</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in paginatedUsers" :key="user.id_administrateur">
            <td>
              <div class="user-cell">
                <div class="avatar">{{ initials(user) }}</div>
                <div>
                  <div class="user-cell__name">
                    {{ user.utilisateur?.prenom }} {{ user.utilisateur?.nom }}
                  </div>
                  <div class="user-cell__id">ID: {{ shortId(user.id_administrateur) }}</div>
                </div>
              </div>
            </td>
            <td><StatusBadge :status="user.niveau_acces || 'ADMIN'" /></td>
            <td class="text-muted">{{ user.utilisateur?.email }}</td>
            <td>
              <span :class="['statut', isOk(user.utilisateur?.status_compte) ? 'statut--ok' : 'statut--pending']">
                {{ formatStatus(user.utilisateur?.status_compte) }}
              </span>
            </td>
            <td class="text-muted">{{ formatDate(user.utilisateur?.date_creation) }}</td>
            <td>
              <div class="action-btns">
                <button class="btn btn--icon btn--sm" title="Voir">👁</button>
                <button class="btn btn--icon btn--sm" title="Modifier"></button>
                <button class="btn btn--icon btn--sm" title="Rôle"></button>
                <button class="btn btn--icon btn--sm" title="Supprimer"
                        @click="handleDelete(user.id_administrateur)">🗑</button>
              </div>
            </td>
          </tr>
          <tr v-if="!admin.loading && paginatedUsers.length === 0">
            <td colspan="6" class="state-msg">Aucun utilisateur trouvé</td>
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
          <a href="#" class="link">Accéder à la file d'attente →</a>
        </div>
      </div>
      <div class="info-card">
        <div class="info-card__icon"></div>
        <div>
          <strong>Rapports d'activité</strong>
          <p>Générez un rapport complet sur l'engagement des utilisateurs et les certifications.</p>
          <a href="#" class="link">Télécharger le rapport mensuel →</a>
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
                   :class="{ 'input--error': v$.firstName.$error }"
                   @blur="v$.firstName.$touch()" />
            <span v-if="v$.firstName.$error" class="field-error">Prénom requis</span>
          </div>
          <div class="field">
            <label>Nom <span class="required">*</span></label>
            <input v-model="newUser.lastName" type="text" placeholder="Ex: Durand"
                   :class="{ 'input--error': v$.lastName.$error }"
                   @blur="v$.lastName.$touch()" />
            <span v-if="v$.lastName.$error" class="field-error">Nom requis</span>
          </div>
          <div class="field">
            <label>Email professionnel <span class="required">*</span></label>
            <input v-model="newUser.email" type="email" placeholder="t.durand@exemple.com"
                   :class="{ 'input--error': v$.email.$error }"
                   @blur="v$.email.$touch()" />
            <span v-if="v$.email.$error" class="field-error">Email valide requis</span>
          </div>
          <div class="field">
            <label>Téléphone</label>
            <input v-model="newUser.phone" type="tel" placeholder="06 00 00 00 00" />
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
import { useVuelidate }  from '@vuelidate/core'
import { required, email as emailRule, minLength } from '@vuelidate/validators'
import StatCard      from '../../components/ui/StatCard.vue'
import StatusBadge   from '../../components/ui/StatusBadge.vue'
import AppPagination from '../../components/ui/AppPagination.vue'
import AppModal      from '../../components/ui/AppModal.vue'
import { useAdminStore } from '../../stores/adminStore'

const admin = useAdminStore()

// ── Stats calculées depuis les vraies données ─────────────
const activeStudentsCount = computed(() =>
  (admin.users || []).filter(u =>
    u.utilisateur?.status_compte === 'ACTIF'
  ).length
)

const professorsCount = computed(() =>
  (admin.users || []).filter(u =>
    u.niveau_acces === 'PROFESSEUR' ||
    u.utilisateur?.role === 'PROFESSEUR'
  ).length
)

// ── Recherche + pagination ────────────────────────────────
const searchQuery = ref('')
const currentPage = ref(1)
const perPage     = 5

const filteredUsers = computed(() =>
  (admin.users || []).filter(u => {
    const fullName = `${u.utilisateur?.prenom || ''} ${u.utilisateur?.nom || ''}`.toLowerCase()
    const email    = (u.utilisateur?.email || '').toLowerCase()
    const q        = searchQuery.value.toLowerCase()
    return fullName.includes(q) || email.includes(q)
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
  const result = await admin.createUser(newUser.value)

  if (result.success) {
    closeModal()
  } else {
    createError.value = result.message
  }
}

async function handleDelete(id) {
  if (!confirm('Supprimer cet utilisateur ?')) return
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

function initials(user) {
  const p = user.utilisateur?.prenom?.[0] || ''
  const n = user.utilisateur?.nom?.[0]    || ''
  return (p + n).toUpperCase() || '?'
}

function shortId(id) {
  if (!id) return '—'
  return id.slice(0, 8)
}

// ── Chargement initial ────────────────────────────────────
onMounted(async () => {
  await Promise.all([
    admin.fetchUsers(),
    admin.fetchVerificationQueue(),
  ])
})
</script>

<style scoped>
.page           { padding: 32px; }
.page__header   { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page__title    { font-size: 24px; font-weight: 700; color: #D6EDE8; }
.page__subtitle { font-size: 14px; color: #8aada9; margin-top: 4px; }
.page__actions  { display: flex; gap: 12px; }

.stats-row { display: flex; gap: 16px; margin-bottom: 20px; }

.card { background: #1A3838; border: 1px solid #2a4a48; border-radius: 12px; padding: 20px; }

.table-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.search-box {
  display: flex; align-items: center; gap: 8px;
  border: 1px solid #2a4a48; border-radius: 8px;
  padding: 8px 12px; width: 320px;
  background: #0f2424;
}
.search-box input { border: none; outline: none; font-size: 13px; width: 100%; color: #c8deda; background: transparent; }

.table { width: 100%; border-collapse: collapse; font-size: 13px; }
.table th {
  text-align: left; padding: 10px;
  font-size: 12px; font-weight: 600; color: #8aada9;
  text-transform: uppercase; border-bottom: 1px solid #2a4a48;
}
.table td { padding: 12px 10px; border-bottom: 1px solid #1e3a3a; color: #c8deda; vertical-align: middle; }
.table tr:hover td { background: #0f2424; }

.user-cell      { display: flex; align-items: center; gap: 10px; }
.user-cell__name { font-weight: 500; font-size: 13px; }
.user-cell__id   { font-size: 11px; color: #4a6e6a; }
.avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: #5C8C6A; color: #fff;
  font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.statut          { font-size: 12px; font-weight: 500; }
.statut--ok      { color: #16a34a; }
.statut--pending { color: #ca8a04; }

.text-muted  { color: #4a6e6a; }
.action-btns { display: flex; gap: 4px; }

.state-msg {
  text-align: center; padding: 24px;
  color: #4a6e6a; font-size: 13px;
}

.error-banner {
  background: #3a1a1a; border: 1px solid #6a2a2a;
  color: #f87171; padding: 10px 16px;
  border-radius: 8px; font-size: 13px; margin-bottom: 20px;
}

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px; }
.info-card {
  background: #1A3838; border: 1px solid #2a4a48;
  border-radius: 12px; padding: 20px;
  display: flex; gap: 14px; align-items: flex-start;
}
.info-card__icon  { font-size: 20px; }
.info-card strong { font-size: 14px; color: #D6EDE8; display: block; margin-bottom: 4px; }
.info-card p      { font-size: 13px; color: #8aada9; margin-bottom: 8px; }

.btn { padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; }
.btn--primary         { background: #5C8C6A; color: #fff; }
.btn--primary:hover   { background: #4a7058; }
.btn--secondary       { background: #1A3838; border: 1px solid #2a4a48; color: #c8deda; }
.btn--secondary:hover { background: #162e2e; }
.btn--sm   { padding: 6px 12px; font-size: 12px; }
.btn--icon { background: transparent; border: 1px solid #2a4a48; color: #8aada9; padding: 5px 9px; }
.btn--icon:hover { background: #162e2e; }

.link { color: #5C8C6A; font-size: 13px; text-decoration: none; font-weight: 500; }
.link:hover { text-decoration: underline; }

/* Modal form */
.form-section { margin-bottom: 20px; }
.form-section--security {
  background: #0f2424; border: 1px solid #2a4a48;
  border-radius: 10px; padding: 16px;
}
.form-section__label {
  font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
  color: #8aada9; text-transform: uppercase; margin-bottom: 14px;
}
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 4px; }
.field label { font-size: 13px; font-weight: 600; color: #c8deda; }
.required    { color: #f87171; }
.field-error { font-size: 11px; color: #f87171; }
.field input, .field select {
  padding: 10px 12px; border: 1px solid #2a4a48;
  border-radius: 8px; font-size: 13px; outline: none;
  background: #1A3838; color: #D6EDE8;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field input:focus, .field select:focus {
  border-color: #5C8C6A;
  box-shadow: 0 0 0 3px rgba(92,140,106,0.15);
}
.input--error { border-color: #f87171 !important; }
.input-group  { display: flex; gap: 8px; }
.input-group input { flex: 1; }
.input-group__btn {
  padding: 8px 12px; border: 1px solid #2a4a48;
  border-radius: 8px; background: #1A3838;
  cursor: pointer; font-size: 12px; color: #c8deda; white-space: nowrap;
}
.checkbox-group { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.checkbox-group label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #c8deda; cursor: pointer; }
</style>