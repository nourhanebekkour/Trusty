<template>
  <div class="page">

    <!-- Page header -->
    <div class="page__header">
      <div>
        <h1 class="page__title">Tableau de Bord Administrateur</h1>
        <p class="page__subtitle">Gérez les certifications et surveillez l'activité de la plateforme.</p>
      </div>
      <div class="page__actions">
        <button class="btn btn--secondary" @click="$router.push('/admin/portfolios')"> Rapports</button>
        <button class="btn btn--primary" @click="showCreateModal = true">+ Créer un utilisateur</button>
      </div>
    </div>

    <!-- Stats row -->
    <div class="stats-row">
      <StatCard label="Étudiants"
                :value="admin.loading ? '…' : formatNumber(admin.stats.studentsActive)"
                sub="Comptes actifs sur la plateforme">
        <template #icon></template>
      </StatCard>
      <StatCard label="Professeurs"
                :value="admin.loading ? '…' : formatNumber(admin.stats.professors)"
                sub="Validations académiques">
        <template #icon></template>
      </StatCard>
      <StatCard label="Professionnels"
                :value="admin.loading ? '…' : formatNumber(admin.stats.partners)"
                sub="Partenaires certifiés">
        <template #icon></template>
      </StatCard>
      <StatCard label="Total Utilisateurs"
                :value="admin.loading ? '…' : formatNumber(totalUsers)"
                sub="Tous rôles confondus">
        <template #icon></template>
      </StatCard>
    </div>

    <!-- Erreur globale -->
    <div v-if="admin.error" class="error-banner"> {{ admin.error }}</div>

    <!-- Main grid -->
    <div class="content-grid">
      <div class="content-grid__main">

        <!-- ── File de vérification ── -->
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
                    <div class="avatar">{{ initials(item.author) }}</div>
                    <span>{{ item.author }}</span>
                  </div>
                </td>
                <td><span class="type-badge">{{ item.type === 'ACTIVITE' ? 'Activité' : 'Professionnel' }}</span></td>
                <td>{{ item.title }}</td>
                <td class="text-muted">{{ formatRelativeDate(item.date) }}</td>
                <td>
                  <div class="action-btns">
                    <button class="btn btn--ghost btn--sm" @click="$router.push('/admin/verifications')"> Consulter</button>
                    <button class="btn btn--primary btn--sm"
                            :disabled="admin.validatingId === item.id"
                            @click="handleValidate(item)">
                      {{ admin.validatingId === item.id ? '…' : '✓ Valider' }}
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
            <a href="/admin/verifications" class="link">Voir tous les éléments en attente →</a>
          </div>
        </div>

        <!-- ── Gestion des Utilisateurs ── -->
        <div class="card" style="margin-top:20px">
          <div class="card__header">
            <div>
              <h2 class="card__title">Gestion des Utilisateurs</h2>
              <p class="card__subtitle">Administration globale des comptes SkillIOS</p>
            </div>
            <div class="search-box">
              <input v-model="userSearch" type="text" placeholder="Rechercher un utilisateur..." />
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
              <tr v-for="u in filteredUsers" :key="u.id_utilisateur">
                <td>{{ u.prenom }} {{ u.nom }}</td>
                <td><StatusBadge :status="u.role || 'ADMIN'" /></td>
                <td>{{ formatStatus(u.status_compte) }}</td>
                <td class="text-muted">{{ u.email }}</td>
                <td class="text-muted">{{ formatDate(u.date_creation) }}</td>
                <td>
                  <button class="btn btn--icon btn--sm"
                          @click="handleDeleteUser(u.id_utilisateur)">•••</button>
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
      <div class="content-grid__side">
        <div class="card">
          <h2 class="card__title">Historique des Certifications</h2>
          <p class="card__subtitle">Actions récentes effectuées sur la plateforme</p>

          <div v-if="admin.loading" class="state-msg">Chargement…</div>

          <div v-else class="cert-list">
            <div v-for="cert in admin.certHistory.slice(0, 10)" :key="cert.id_historique || cert.id" class="cert-item">
              <div class="cert-item__icon">✓</div>
              <div class="cert-item__body">
                <p class="cert-item__text">
                  <strong>{{ cert.utilisateur?.prenom || '' }} {{ cert.utilisateur?.nom || '' }}</strong>
                  {{ cert.action || 'action' }}
                  <em>{{ cert.type_entite || '' }}</em>
                </p>
                <span class="cert-item__time">{{ formatDate(cert.date_action || cert.date_creation) }}</span>
              </div>
            </div>
            <div v-if="admin.certHistory.length === 0" class="state-msg">
              Aucune certification récente
            </div>
          </div>

          <div class="card__footer">
            <a href="/admin/historique" class="link">Voir l'audit complet →</a>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Modal Créer un utilisateur ── -->
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
                   :class="{ 'input--error': v$.firstName.$error }" @blur="v$.firstName.$touch()" />
            <span v-if="v$.firstName.$error" class="field-error">Prénom requis</span>
          </div>
          <div class="field">
            <label>Nom <span class="required">*</span></label>
            <input v-model="newUser.lastName" type="text" placeholder="Ex: Durand"
                   maxlength="50"
                   :class="{ 'input--error': v$.lastName.$error }" @blur="v$.lastName.$touch()" />
            <span v-if="v$.lastName.$error" class="field-error">Nom requis</span>
          </div>
          <div class="field">
            <label>Email professionnel <span class="required">*</span></label>
            <input v-model="newUser.email" type="email" placeholder="t.durand@exemple.com"
                   maxlength="100"
                   :class="{ 'input--error': v$.email.$error }" @blur="v$.email.$touch()" />
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
import { useRouter } from 'vue-router'
import { useVuelidate }  from '@vuelidate/core'
import { required, email as emailRule, minLength } from '@vuelidate/validators'
import StatCard    from '../../components/ui/StatCard.vue'
import StatusBadge from '../../components/ui/StatusBadge.vue'
import AppModal    from '../../components/ui/AppModal.vue'
import { useAdminStore } from '../../stores/adminStore'
import { useAuthStore }  from '../../stores/authstore'

const admin     = useAdminStore()
const authStore = useAuthStore()
const router    = useRouter()

// ── État modal ────────────────────────────────────────────
const showCreateModal = ref(false)
const showPwd         = ref(false)
const createError     = ref(null)
const creating        = ref(false)

const totalUsers = computed(() =>
  (admin.users || []).length
)

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

// ── Sécurité : sanitisation avant envoi ──────────────────
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
    password:  user.password, // le hash est géré côté serveur
  }
}

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
  const valid = await v$.value.$validate()
  if (!valid) return

  creating.value    = true
  createError.value = null

  // Sécurité : soumettre les données sanitisées
  const result = await admin.createUser(sanitizeUser(newUser.value))

  creating.value = false

  if (result.success) {
    closeModal()
  } else {
    createError.value = result.message
  }
}

// ── Actions table ─────────────────────────────────────────
async function handleDeleteUser(id) {
  await admin.deleteUser(id)
}

async function handleValidate(item) {
  await admin.validateEntity(item.type, item.id, 'VALIDE')
}

// ── Recherche utilisateurs ────────────────────────────────
const userSearch = ref('')

const filteredUsers = computed(() =>
  (admin.users || []).filter(u => {
    const fullName = `${u.prenom || ''} ${u.nom || ''}`.toLowerCase()
    const email    = (u.email || '').toLowerCase()
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

// ── Chargement initial avec guard de rôle ────────────────
onMounted(async () => {
  if (!authStore.user || authStore.user.role !== 'ADMINISTRATEUR') {
    router.replace('/login')
    return
  }

  await Promise.all([
    admin.fetchDashboardStats(),
    admin.fetchUsers(),
    admin.fetchVerificationQueue(),
    admin.fetchCertHistory(),
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
.page__title    { font-size: 24px; font-weight: 700; color: var(--color-text-primary); }
.page__subtitle { font-size: 14px; color: var(--color-text-secondary); margin-top: 4px; }
.page__actions  { display: flex; gap: 12px; }

.stats-row { display: flex; gap: 16px; margin-bottom: 24px; }

.content-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 20px;
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 20px;
}
.card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.card__title    { font-size: 16px; font-weight: 600; color: var(--color-text-primary); }
.card__subtitle { font-size: 13px; color: var(--color-text-secondary); margin-top: 2px; }
.card__footer   { margin-top: 12px; text-align: center; }

.table { width: 100%; border-collapse: collapse; font-size: 13px; }
.table th {
  text-align: left;
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  background: var(--color-surface-alt);
  border-bottom: 1px solid var(--color-border-light);
}
.table td {
  padding: 10px;
  border-bottom: 1px solid var(--color-border-light);
  color: var(--color-text-primary);
  vertical-align: middle;
}
.table tr:hover td { background: var(--color-surface-hover); }

.user-cell { display: flex; align-items: center; gap: 8px; }
.avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--color-accent);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.type-badge {
  background: var(--color-accent-light);
  color: var(--color-accent);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}
.text-muted { color: var(--color-text-tertiary); }
.action-btns { display: flex; gap: 6px; }

.state-msg {
  text-align: center;
  padding: 20px;
  color: var(--color-text-tertiary);
  font-size: 13px;
}

.cert-list { display: flex; flex-direction: column; gap: 16px; margin-top: 12px; }
.cert-item { display: flex; gap: 10px; align-items: flex-start; }
.cert-item__icon {
  width: 24px; height: 24px; min-width: 24px;
  border-radius: 50%;
  background: var(--color-valid-bg);
  color: var(--color-valid-text);
  font-size: 12px;
  display: flex; align-items: center; justify-content: center;
}
.cert-item__text { font-size: 13px; color: var(--color-text-primary); line-height: 1.4; }
.cert-item__text strong { color: var(--color-text-primary); }
.cert-item__time { font-size: 11px; color: var(--color-text-tertiary); margin-top: 2px; display: block; }

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
.btn--primary         { background: var(--color-accent); color: #fff; }
.btn--primary:hover   { background: var(--color-accent-hover); }
.btn--secondary       { background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text-secondary); }
.btn--secondary:hover { background: var(--color-surface-hover); }
.btn--ghost           { background: transparent; color: var(--color-accent); border: 1px solid var(--color-border); }
.btn--sm              { padding: 5px 10px; font-size: 12px; }
.btn--icon            { background: transparent; border: 1px solid var(--color-border); color: var(--color-text-tertiary); padding: 6px 10px; }
.btn--icon:hover      { background: var(--color-surface-hover); }

.search-box { display: flex; gap: 8px; align-items: center; }
.search-box input {
  padding: 7px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  width: 220px;
  background: var(--color-surface-alt);
  color: var(--color-text-primary);
}
.search-box input:focus { border-color: var(--color-accent); }

.badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
.badge--warning { background: var(--color-waiting-bg); color: var(--color-waiting-text); }

.link { color: var(--color-accent); font-size: 13px; text-decoration: none; }
.link:hover { text-decoration: underline; }

.error-banner {
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.3);
  color: var(--color-danger);
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 20px;
}

.form-section { margin-bottom: 20px; }
.form-section--security {
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border-light);
  border-radius: 10px;
  padding: 16px;
}
.form-section__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  margin-bottom: 14px;
}
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 4px; }
.field label { font-size: 13px; font-weight: 600; color: var(--color-text-secondary); }
.required { color: var(--color-danger); }
.field input, .field select {
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  background: var(--color-surface-alt);
  color: var(--color-text-primary);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field input:focus, .field select:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-light);
}
.input--error { border-color: var(--color-danger) !important; }
.field-error  { font-size: 11px; color: var(--color-danger); margin-top: 2px; }

.input-group { display: flex; gap: 8px; }
.input-group input { flex: 1; }
.input-group__btn {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  cursor: pointer;
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.checkbox-group { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.checkbox-group label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--color-text-secondary); cursor: pointer; }
</style>