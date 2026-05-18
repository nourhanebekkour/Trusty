<template>
  <div class="page">

    <!-- Page header -->
    <div class="page__header">
      <div>
        <h1 class="page__title">Tableau de Bord Administrateur</h1>
        <p class="page__subtitle">Gérez les certifications et surveillez l'activité de la plateforme.</p>
      </div>
      <div class="page__actions">
        <button class="btn btn--secondary"> Rapport d'activité</button>
        <button class="btn btn--primary" @click="showCreateModal = true">+ Créer un utilisateur</button>
      </div>
    </div>

    <!-- Stats row -->
    <div class="stats-row">
      <StatCard label="Étudiants Actifs"
                :value="admin.loading ? '…' : formatNumber(admin.stats.studentsActive)"
                trend="↑ +12%" trend-color="green" sub="Nouveaux inscrits ce mois-ci">
        <template #icon></template>
      </StatCard>
      <StatCard label="Portfolios Créés"
                :value="admin.loading ? '…' : formatNumber(admin.stats.portfoliosCreated)"
                trend="↑ +8%" trend-color="blue" sub="Taux de complétion de 85%">
        <template #icon></template>
      </StatCard>
      <StatCard label="Professeurs"
                :value="admin.loading ? '…' : formatNumber(admin.stats.professors)"
                trend="↑ +4%" trend-color="green" sub="Validations académiques">
        <template #icon></template>
      </StatCard>
      <StatCard label="Partenaires Pro"
                :value="admin.loading ? '…' : formatNumber(admin.stats.partners)"
                trend="↑ +15%" trend-color="blue" sub="Recruteurs certifiés">
        <template #icon></template>
      </StatCard>
    </div>

    <!-- Erreur globale -->
    <div v-if="admin.error" class="error-banner"> {{ admin.error }}</div>

    <!-- Main grid -->
    <div class="content-grid">
      <div class="content-grid__main">

        <!-- ── File de vérification ── -->
        <!-- Source : admin.verificationQueue (GET /admin/verifications)
             Service : recupererFileVerification() dans administrateurService.js
             Structure item : { id, studentName, type, description, createdAt } -->
        <div class="card">
          <div class="card__header">
            <div>
              <h2 class="card__title">File d'attente de vérification</h2>
              <p class="card__subtitle">Éléments en attente de validation institutionnelle</p>
            </div>
            <span class="badge badge--warning">
              {{ admin.verificationQueue.length }} à traiter
            </span>
          </div>

          <div v-if="admin.loading" class="state-msg">Chargement…</div>

          <table v-else class="table">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Type</th>
                <th>Détail</th>
                <th>Soumis</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in admin.verificationQueue" :key="item.id">
                <td>
                  <div class="user-cell">
                    <div class="avatar">{{ initials(item.studentName) }}</div>
                    <span>{{ item.studentName }}</span>
                  </div>
                </td>
                <td><span class="type-badge">{{ item.type }}</span></td>
                <td>{{ item.description }}</td>
                <td class="text-muted">{{ formatRelativeDate(item.createdAt) }}</td>
                <td>
                  <div class="action-btns">
                    <button class="btn btn--ghost btn--sm"> Consulter</button>
                    <button class="btn btn--primary btn--sm"
                            :disabled="certifyingId === item.id"
                            @click="handleCertify(item.id)">
                      {{ certifyingId === item.id ? '…' : '✓ Vérifier' }}
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!admin.loading && admin.verificationQueue.length === 0">
                <td colspan="5" class="state-msg">Aucun élément en attente ✓</td>
              </tr>
            </tbody>
          </table>

          <div class="card__footer">
            <a href="#" class="link">Voir tous les éléments en attente →</a>
          </div>
        </div>

        <!-- ── Gestion des Utilisateurs ── -->
        <!-- Source : admin.users (GET /admin/users → recupererTousLesAdmins)
             Structure item : { id_administrateur, niveau_acces,
               utilisateur: { nom, prenom, email, date_creation, status_compte } } -->
        <div class="card" style="margin-top:20px">
          <div class="card__header">
            <div>
              <h2 class="card__title">Gestion des Utilisateurs</h2>
              <p class="card__subtitle">Administration globale des comptes SkillIOS</p>
            </div>
            <div class="search-box">
              <input v-model="userSearch" type="text" placeholder="🔍 Rechercher un utilisateur..." />
              <button class="btn btn--icon">⚙</button>
            </div>
          </div>

          <div v-if="admin.loading" class="state-msg">Chargement…</div>

          <table v-else class="table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Email</th>
                <th>Date d'inscription</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in filteredUsers" :key="u.id_administrateur">
                <td>{{ u.utilisateur?.prenom }} {{ u.utilisateur?.nom }}</td>
                <td><StatusBadge :status="u.niveau_acces || 'ADMIN'" /></td>
                <td>{{ formatStatus(u.utilisateur?.status_compte) }}</td>
                <td class="text-muted">{{ u.utilisateur?.email }}</td>
                <td class="text-muted">{{ formatDate(u.utilisateur?.date_creation) }}</td>
                <td>
                  <button class="btn btn--icon btn--sm"
                          @click="handleDeleteUser(u.id_administrateur)">•••</button>
                </td>
              </tr>
              <tr v-if="!admin.loading && filteredUsers.length === 0">
                <td colspan="6" class="state-msg">Aucun utilisateur trouvé</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── Historique des Certifications ── -->
      <!-- Source : admin.certHistory (GET /admin/certifications/history)
           Service : recupererHistoriqueCertifications() dans administrateurService.js
           Structure item : { id, validatorName, actionLabel, entityType,
                              entityTitle, targetName, createdAt } -->
      <div class="content-grid__side">
        <div class="card">
          <h2 class="card__title">Historique des Certifications</h2>
          <p class="card__subtitle">Actions récentes effectuées sur la plateforme</p>

          <div v-if="admin.loading" class="state-msg">Chargement…</div>

          <div v-else class="cert-list">
            <div v-for="cert in admin.certHistory" :key="cert.id" class="cert-item">
              <div class="cert-item__icon">✓</div>
              <div class="cert-item__body">
                <p class="cert-item__text">
                  <strong>{{ cert.validatorName }}</strong>
                  {{ cert.actionLabel }} le {{ cert.entityType }}
                  <em>"{{ cert.entityTitle }}"</em>
                  pour <strong>{{ cert.targetName }}</strong>
                </p>
                <span class="cert-item__time">{{ formatDate(cert.createdAt) }}</span>
              </div>
            </div>
            <div v-if="admin.certHistory.length === 0" class="state-msg">
              Aucune certification récente
            </div>
          </div>

          <div class="card__footer">
            <a href="#" class="link">Voir l'audit complet →</a>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Modal Créer un utilisateur ── -->
    <!-- Envoie POST /api/auth/register avec { email, password, nom, prenom, role } -->
    <AppModal
      :show="showCreateModal"
      title="Créer un profil complet"
      subtitle="Saisissez les informations personnelles et configurez la sécurité initiale du compte."
      @close="closeModal"
      @confirm="handleCreateUser"
    >
      <!-- Feedback erreur dans le modal -->
      <div v-if="createError" class="error-banner" style="margin-bottom:16px">
         {{ createError }}
      </div>

      <div class="form-section">
        <div class="form-section__label"> INFORMATIONS PERSONNELLES</div>
        <div class="form-grid">
          <div class="field">
            <label>Prénom <span class="required">*</span></label>
            <input v-model="newUser.firstName" type="text" placeholder="Ex: Thomas"
                   :class="{ 'input--error': v$.firstName.$error }" @blur="v$.firstName.$touch()" />
            <span v-if="v$.firstName.$error" class="field-error">Prénom requis</span>
          </div>
          <div class="field">
            <label>Nom <span class="required">*</span></label>
            <input v-model="newUser.lastName" type="text" placeholder="Ex: Durand"
                   :class="{ 'input--error': v$.lastName.$error }" @blur="v$.lastName.$touch()" />
            <span v-if="v$.lastName.$error" class="field-error">Nom requis</span>
          </div>
          <div class="field">
            <label>Email professionnel <span class="required">*</span></label>
            <input v-model="newUser.email" type="email" placeholder="t.durand@exemple.com"
                   :class="{ 'input--error': v$.email.$error }" @blur="v$.email.$touch()" />
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
            <button type="button" class="input-group__btn" @click="generatePassword">↻ Générer un mot de passe fort</button>
          </div>
          <span v-if="v$.password.$error" class="field-error">
            Mot de passe requis (min. 8 caractères)
          </span>
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
import StatCard    from '../../components/ui/StatCard.vue'
import StatusBadge from '../../components/ui/StatusBadge.vue'
import AppModal    from '../../components/ui/AppModal.vue'
import { useAdminStore } from '../../stores/adminStore'

const admin = useAdminStore()

// ── État modal ────────────────────────────────────────────
const showCreateModal = ref(false)
const showPwd         = ref(false)
const createError     = ref(null)
const certifyingId    = ref(null)
const creating        = ref(false)

const emptyUser = () => ({
  firstName: '', lastName: '', email: '', phone: '',
  role: 'Étudiant', birthdate: '', password: '',
  forceChange: true, twoFactor: false,
})
const newUser = ref(emptyUser())

// ── Validation (Vuelidate) ────────────────────────────────
const rules = {
  firstName: { required },
  lastName:  { required },
  email:     { required, emailRule },
  password:  { required, minLength: minLength(8) },
}
const v$ = useVuelidate(rules, newUser)

// ── Actions modal ─────────────────────────────────────────
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
  // Valider tous les champs
  const valid = await v$.value.$validate()
  if (!valid) return

  creating.value    = true
  createError.value = null

  const result = await admin.createUser(newUser.value)

  creating.value = false

  if (result.success) {
    closeModal()
  } else {
    createError.value = result.message
  }
}

// ── Actions table ─────────────────────────────────────────
async function handleDeleteUser(id) {
  if (!confirm('Supprimer cet utilisateur ?')) return
  await admin.deleteUser(id)
}

async function handleCertify(id) {
  certifyingId.value = id
  await admin.certifyPortfolio(id)
  certifyingId.value = null
}

// ── Recherche utilisateurs ────────────────────────────────
const userSearch = ref('')

const filteredUsers = computed(() =>
  (admin.users || []).filter(u => {
    const fullName = `${u.utilisateur?.prenom || ''} ${u.utilisateur?.nom || ''}`.toLowerCase()
    const email    = (u.utilisateur?.email || '').toLowerCase()
    const q        = userSearch.value.toLowerCase()
    return fullName.includes(q) || email.includes(q)
  })
)

// ── Helpers formatage ─────────────────────────────────────
function formatNumber(val) {
  if (!val && val !== 0) return '—'
  return Number(val).toLocaleString('fr-FR')
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

function formatRelativeDate(dateStr) {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const h    = Math.floor(diff / 3600000)
  const d    = Math.floor(diff / 86400000)
  if (h < 1)  return 'À l\'instant'
  if (h < 24) return `Il y a ${h}h`
  if (d === 1) return 'Hier'
  return `Il y a ${d} jours`
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

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// ── Chargement initial ────────────────────────────────────
onMounted(async () => {
  await Promise.all([
    admin.fetchDashboardStats(),     // GET /admin/stats
    admin.fetchUsers(),              // GET /admin/users
    admin.fetchVerificationQueue(),  // GET /admin/verifications
    admin.fetchCertHistory(),        // GET /admin/certifications/history
  ])
})
</script>

<style scoped>
.page { padding: 32px; }

.page__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}
.page__title    { font-size: 24px; font-weight: 700; color: #D6EDE8; }
.page__subtitle { font-size: 14px; color: #8aada9; margin-top: 4px; }
.page__actions  { display: flex; gap: 12px; }

.stats-row { display: flex; gap: 16px; margin-bottom: 24px; }

.content-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 20px;
}

.card {
  background: #1A3838;
  border: 1px solid #2a4a48;
  border-radius: 12px;
  padding: 20px;
}
.card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.card__title    { font-size: 16px; font-weight: 600; color: #D6EDE8; }
.card__subtitle { font-size: 13px; color: #8aada9; margin-top: 2px; }
.card__footer   { margin-top: 12px; text-align: center; }

.table { width: 100%; border-collapse: collapse; font-size: 13px; }
.table th {
  text-align: left;
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #8aada9;
  text-transform: uppercase;
  background: #0f2424;
  border-bottom: 1px solid #2a4a48;
}
.table td {
  padding: 10px;
  border-bottom: 1px solid #1e3a3a;
  color: #c8deda;
  vertical-align: middle;
}
.table tr:hover td { background: #0f2424; }

.user-cell { display: flex; align-items: center; gap: 8px; }
.avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: #5C8C6A;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.type-badge {
  background: #162e2e;
  color: #c8deda;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}
.text-muted { color: #4a6e6a; }
.action-btns { display: flex; gap: 6px; }

.state-msg {
  text-align: center;
  padding: 20px;
  color: #4a6e6a;
  font-size: 13px;
}

.cert-list { display: flex; flex-direction: column; gap: 16px; margin-top: 12px; }
.cert-item { display: flex; gap: 10px; align-items: flex-start; }
.cert-item__icon {
  width: 24px; height: 24px; min-width: 24px;
  border-radius: 50%;
  background: #dcfce7;
  color: #16a34a;
  font-size: 12px;
  display: flex; align-items: center; justify-content: center;
}
.cert-item__text { font-size: 13px; color: #c8deda; line-height: 1.4; }
.cert-item__time { font-size: 11px; color: #4a6e6a; margin-top: 2px; display: block; }

.btn {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
}
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn--primary         { background: #5C8C6A; color: #fff; }
.btn--primary:hover   { background: #4a7058; }
.btn--secondary       { background: #1A3838; border: 1px solid #2a4a48; color: #c8deda; }
.btn--secondary:hover { background: #162e2e; }
.btn--ghost           { background: transparent; color: #5C8C6A; border: 1px solid #2a4a48; }
.btn--sm              { padding: 5px 10px; font-size: 12px; }
.btn--icon            { background: transparent; border: 1px solid #2a4a48; color: #8aada9; padding: 6px 10px; }

.search-box { display: flex; gap: 8px; align-items: center; }
.search-box input {
  padding: 7px 12px;
  border: 1px solid #2a4a48;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  width: 220px;
  background: #0f2424;
  color: #D6EDE8;
}
.search-box input:focus { border-color: #5C8C6A; }

.badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
.badge--warning { background: #fef9c3; color: #ca8a04; }

.link { color: #5C8C6A; font-size: 13px; text-decoration: none; }
.link:hover { text-decoration: underline; }

.error-banner {
  background: #3a1a1a;
  border: 1px solid #6a2a2a;
  color: #f87171;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 20px;
}

/* Form */
.form-section { margin-bottom: 20px; }
.form-section--security {
  background: #0f2424;
  border: 1px solid #2a4a48;
  border-radius: 10px;
  padding: 16px;
}
.form-section__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #8aada9;
  text-transform: uppercase;
  margin-bottom: 14px;
}
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 4px; }
.field label { font-size: 13px; font-weight: 600; color: #c8deda; }
.required { color: #f87171; }
.field input, .field select {
  padding: 10px 12px;
  border: 1px solid #2a4a48;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  background: #1A3838;
  color: #D6EDE8;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field input:focus, .field select:focus {
  border-color: #5C8C6A;
  box-shadow: 0 0 0 3px rgba(92,140,106,0.15);
}
.input--error { border-color: #f87171 !important; }
.field-error  { font-size: 11px; color: #f87171; margin-top: 2px; }

.input-group { display: flex; gap: 8px; }
.input-group input { flex: 1; }
.input-group__btn {
  padding: 8px 12px;
  border: 1px solid #2a4a48;
  border-radius: 8px;
  background: #1A3838;
  cursor: pointer;
  font-size: 12px;
  color: #c8deda;
  white-space: nowrap;
}
.checkbox-group { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.checkbox-group label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #c8deda; cursor: pointer; }
</style>