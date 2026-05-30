<template>
  <div class="admin-page">
    <header class="admin-page__header">
      <div>
        <h1 class="admin-page__title">Tableau de bord Administrateur</h1>
        <p class="admin-page__subtitle">
          Suivi des comptes, validations administratives et activite recente de TRUSTY.
        </p>
      </div>

      <div class="admin-page__actions">
        <button class="admin-btn admin-btn--secondary" type="button" @click="refreshAll">
          <RefreshCw :size="16" />
          Actualiser
        </button>
        <button class="admin-btn" type="button" @click="showCreateModal = true">
          <UserPlus :size="16" />
          Creer un utilisateur
        </button>
      </div>
    </header>

    <section class="admin-stats">
      <article class="admin-stat admin-stat--accent">
        <span class="admin-stat__label">Etudiants actifs</span>
        <strong class="admin-stat__value">{{ admin.loading ? '...' : formatNumber(admin.stats.studentsActive) }}</strong>
        <span class="admin-stat__sub">Comptes ETUDIANT au statut ACTIF</span>
      </article>
      <article class="admin-stat">
        <span class="admin-stat__label">Verifications</span>
        <strong class="admin-stat__value">{{ admin.loading ? '...' : admin.verificationQueue.length }}</strong>
        <span class="admin-stat__sub">Activites et professionnels en attente</span>
      </article>
      <article class="admin-stat">
        <span class="admin-stat__label">Professeurs</span>
        <strong class="admin-stat__value">{{ admin.loading ? '...' : formatNumber(admin.stats.professors) }}</strong>
        <span class="admin-stat__sub">Comptes PROFESSEUR</span>
      </article>
      <article class="admin-stat">
        <span class="admin-stat__label">Professionnels</span>
        <strong class="admin-stat__value">{{ admin.loading ? '...' : formatNumber(admin.stats.partners) }}</strong>
        <span class="admin-stat__sub">Partenaires et recruteurs</span>
      </article>
    </section>

    <div v-if="admin.error" class="admin-error">{{ admin.error }}</div>

    <section class="admin-grid">
      <div class="admin-stack">
        <article class="admin-card">
          <div class="admin-card__header">
            <div>
              <h2 class="admin-card__title">File de verification</h2>
              <p class="admin-card__subtitle">Donnees branchees sur /activites/a-valider et /professionnels/en-attente.</p>
            </div>
            <span class="admin-badge admin-badge--warning">{{ admin.verificationQueue.length }} a traiter</span>
          </div>

          <div v-if="admin.loading" class="admin-state">Chargement...</div>
          <div v-else-if="admin.verificationQueue.length === 0" class="admin-state">
            Aucun element en attente.
          </div>
          <div v-else class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Demandeur</th>
                  <th>Type</th>
                  <th>Detail</th>
                  <th>Soumis</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in admin.verificationQueue.slice(0, 5)" :key="item.id">
                  <td>
                    <div class="admin-user-cell">
                      <span class="admin-avatar">{{ initials(item.studentName) }}</span>
                      <div>
                        <strong>{{ item.studentName }}</strong>
                        <div class="admin-muted">{{ item.title }}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="admin-badge">{{ item.type }}</span></td>
                  <td>{{ item.description }}</td>
                  <td class="admin-muted">{{ formatDate(item.createdAt) }}</td>
                  <td>
                    <div class="admin-actions">
                      <button class="admin-btn admin-btn--sm" type="button" @click="handleValidate(item, 'VALIDE')">
                        <Check :size="14" />
                        Valider
                      </button>
                      <button class="admin-btn admin-btn--secondary admin-btn--sm" type="button" @click="handleValidate(item, 'REJETE')">
                        <X :size="14" />
                        Rejeter
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article class="admin-card">
          <div class="admin-card__header">
            <div>
              <h2 class="admin-card__title">Gestion des utilisateurs</h2>
              <p class="admin-card__subtitle">Comptes issus de /utilisateurs avec les roles Prisma existants.</p>
            </div>
            <input v-model="userSearch" class="admin-input" type="search" placeholder="Rechercher..." />
          </div>

          <div v-if="admin.loading" class="admin-state">Chargement...</div>
          <div v-else-if="filteredUsers.length === 0" class="admin-state">Aucun utilisateur trouve.</div>
          <div v-else class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Role</th>
                  <th>Statut</th>
                  <th>Email</th>
                  <th>Inscription</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers.slice(0, 6)" :key="user.id_utilisateur">
                  <td>
                    <div class="admin-user-cell">
                      <span class="admin-avatar">{{ initials(fullName(user)) }}</span>
                      <strong>{{ fullName(user) }}</strong>
                    </div>
                  </td>
                  <td><span class="admin-badge">{{ user.utilisateur?.role || '-' }}</span></td>
                  <td>
                    <span :class="['admin-badge', statusClass(user.utilisateur?.status_compte)]">
                      {{ formatStatus(user.utilisateur?.status_compte) }}
                    </span>
                  </td>
                  <td class="admin-muted">{{ user.utilisateur?.email }}</td>
                  <td class="admin-muted">{{ formatDate(user.utilisateur?.date_creation) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </div>

      <aside class="admin-card">
        <div class="admin-card__header">
          <div>
            <h2 class="admin-card__title">Historique recent</h2>
            <p class="admin-card__subtitle">Actions lues depuis /historique-actions.</p>
          </div>
          <FileText :size="18" />
        </div>

        <div v-if="admin.loading" class="admin-state">Chargement...</div>
        <div v-else-if="admin.certHistory.length === 0" class="admin-state">Aucune certification recente.</div>
        <div v-else class="admin-timeline">
          <div v-for="entry in admin.certHistory.slice(0, 8)" :key="entry.id" class="admin-timeline__item">
            <span class="admin-timeline__dot"></span>
            <div class="admin-timeline__body">
              <strong>{{ entry.validatorName }}</strong>
              {{ entry.actionLabel }} {{ entry.entityType }}
              <div class="admin-muted">{{ entry.entityTitle }}</div>
              <div class="admin-muted">{{ formatDate(entry.createdAt) }}</div>
            </div>
          </div>
        </div>
      </aside>
    </section>

    <div v-if="showCreateModal" class="admin-modal-backdrop" @click.self="closeModal">
      <form class="admin-modal" @submit.prevent="handleCreateUser">
        <div class="admin-modal__header">
          <div>
            <h2 class="admin-modal__title">Creer un profil</h2>
            <p class="admin-modal__subtitle">
              Le formulaire respecte les roles Prisma et les endpoints d'authentification existants.
            </p>
          </div>
          <button class="admin-btn admin-btn--secondary admin-btn--sm" type="button" @click="closeModal">Fermer</button>
        </div>

        <div v-if="createError" class="admin-error">{{ createError }}</div>

        <div class="admin-form-grid">
          <div class="admin-field">
            <label for="first-name">Prenom</label>
            <input id="first-name" v-model.trim="newUser.firstName" class="admin-input" required />
          </div>
          <div class="admin-field">
            <label for="last-name">Nom</label>
            <input id="last-name" v-model.trim="newUser.lastName" class="admin-input" required />
          </div>
          <div class="admin-field">
            <label for="email">Email</label>
            <input id="email" v-model.trim="newUser.email" class="admin-input" type="email" required />
          </div>
          <div class="admin-field">
            <label for="phone">Telephone</label>
            <input id="phone" v-model.trim="newUser.phone" class="admin-input" type="tel" />
          </div>
          <div class="admin-field">
            <label for="role">Role plateforme</label>
            <select id="role" v-model="newUser.role" class="admin-select">
              <option>Etudiant</option>
              <option>Professeur</option>
              <option>Professionnel</option>
              <option>Administrateur</option>
            </select>
          </div>
          <div class="admin-field">
            <label for="ecole">Ecole</label>
            <select id="ecole" v-model="newUser.ecole" class="admin-select" :disabled="newUser.role === 'Professionnel'">
              <option value="">Non renseignee</option>
              <option v-for="ecole in ecoles" :key="ecole" :value="ecole">{{ ecole }}</option>
            </select>
          </div>
          <div v-if="newUser.role !== 'Administrateur'" class="admin-field">
            <label for="password">Mot de passe provisoire</label>
            <input id="password" v-model="newUser.password" class="admin-input" type="password" required minlength="8" />
          </div>
          <div v-else class="admin-field">
            <label for="niveau">Niveau d'acces</label>
            <select id="niveau" v-model="newUser.niveau_acces" class="admin-select">
              <option>ADMIN</option>
              <option>SUPER_ADMIN</option>
            </select>
          </div>
        </div>

        <div class="admin-modal__footer">
          <button class="admin-btn admin-btn--secondary" type="button" @click="closeModal">Annuler</button>
          <button class="admin-btn" type="submit" :disabled="creating">
            {{ creating ? 'Creation...' : 'Enregistrer le profil' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { Check, FileText, RefreshCw, UserPlus, X } from 'lucide-vue-next'
import { useAdminStore } from '../../stores/adminStore'

const admin = useAdminStore()
const userSearch = ref('')
const showCreateModal = ref(false)
const createError = ref(null)
const creating = ref(false)

const ecoles = [
  'ENSATanger',
  'ENCGTanger',
  'FSTTanger',
  'FSJESTanger',
  'ENSATetouan',
  'ENSTetouan',
  'FSTetouan',
  'FLSHMartil',
  'FSJESTetouan',
  'ENSAAlHoceima',
  'FSTAlHoceima',
  'FPDAlHoceima',
]

const emptyUser = () => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'Etudiant',
  ecole: '',
  password: '',
  niveau_acces: 'ADMIN',
})

const newUser = ref(emptyUser())

const filteredUsers = computed(() => {
  const q = userSearch.value.trim().toLowerCase()
  if (!q) return admin.users

  return admin.users.filter(user => {
    const name = fullName(user).toLowerCase()
    const email = (user.utilisateur?.email || '').toLowerCase()
    const role = (user.utilisateur?.role || '').toLowerCase()
    return name.includes(q) || email.includes(q) || role.includes(q)
  })
})

function fullName(user) {
  return admin.userFullName(user)
}

function closeModal() {
  showCreateModal.value = false
  createError.value = null
  newUser.value = emptyUser()
}

async function handleCreateUser() {
  creating.value = true
  createError.value = null
  const result = await admin.createUser(newUser.value)
  creating.value = false

  if (result.success) closeModal()
  else createError.value = result.message
}

async function handleValidate(item, decision) {
  const result = await admin.validateVerification(item, decision)
  if (!result.success) createError.value = result.message
}

async function refreshAll() {
  await Promise.all([
    admin.fetchDashboardStats(),
    admin.fetchCertHistory(),
  ])
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('fr-FR')
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatStatus(status) {
  const labels = {
    ACTIF: 'Actif',
    INACTIF: 'Inactif',
    SUSPENDU: 'Suspendu',
  }
  return labels[status] || status || '-'
}

function statusClass(status) {
  if (status === 'ACTIF') return 'admin-badge--success'
  if (status === 'SUSPENDU') return 'admin-badge--danger'
  return 'admin-badge--warning'
}

function initials(name) {
  return (name || '?')
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

onMounted(refreshAll)
</script>
