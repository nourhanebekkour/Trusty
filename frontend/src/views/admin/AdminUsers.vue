<template>
  <div class="admin-page">
    <header class="admin-page__header">
      <div>
        <h1 class="admin-page__title">Gestion des utilisateurs</h1>
        <p class="admin-page__subtitle">
          Administration des comptes selon les roles Prisma: ETUDIANT, PROFESSEUR, ADMINISTRATEUR et PROFESSIONNEL.
        </p>
      </div>

      <div class="admin-page__actions">
        <button class="admin-btn admin-btn--secondary" type="button" @click="admin.fetchUsers">
          <RefreshCw :size="16" />
          Actualiser
        </button>
      </div>
    </header>

    <section class="admin-stats">
      <article class="admin-stat admin-stat--accent">
        <span class="admin-stat__label">Total utilisateurs</span>
        <strong class="admin-stat__value">{{ admin.users.length }}</strong>
        <span class="admin-stat__sub">Depuis /utilisateurs</span>
      </article>
      <article class="admin-stat">
        <span class="admin-stat__label">Etudiants actifs</span>
        <strong class="admin-stat__value">{{ activeStudentsCount }}</strong>
        <span class="admin-stat__sub">status_compte = ACTIF</span>
      </article>
      <article class="admin-stat">
        <span class="admin-stat__label">Professeurs</span>
        <strong class="admin-stat__value">{{ roleCount('PROFESSEUR') }}</strong>
        <span class="admin-stat__sub">Validation academique</span>
      </article>
      <article class="admin-stat">
        <span class="admin-stat__label">Professionnels</span>
        <strong class="admin-stat__value">{{ roleCount('PROFESSIONNEL') }}</strong>
        <span class="admin-stat__sub">Partenaires externes</span>
      </article>
    </section>

    <div v-if="admin.error" class="admin-error">{{ admin.error }}</div>

    <article class="admin-card">
      <div class="admin-card__header">
        <div>
          <h2 class="admin-card__title">Annuaire des comptes</h2>
          <p class="admin-card__subtitle">Modification du statut via PATCH /utilisateurs/:id/statut.</p>
        </div>
        <div class="admin-actions">
          <input v-model="searchQuery" class="admin-input" type="search" placeholder="Rechercher par nom, email, role" />
          <select v-model="roleFilter" class="admin-select">
            <option value="">Tous les roles</option>
            <option>ETUDIANT</option>
            <option>PROFESSEUR</option>
            <option>ADMINISTRATEUR</option>
            <option>PROFESSIONNEL</option>
          </select>
        </div>
      </div>

      <div v-if="admin.loading" class="admin-state">Chargement...</div>
      <div v-else-if="paginatedUsers.length === 0" class="admin-state">Aucun utilisateur trouve.</div>
      <div v-else class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Role</th>
              <th>Statut</th>
              <th>Email</th>
              <th>Ecole</th>
              <th>Date d'inscription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paginatedUsers" :key="user.id_utilisateur">
              <td>
                <div class="admin-user-cell">
                  <span class="admin-avatar">{{ initials(fullName(user)) }}</span>
                  <div>
                    <strong>{{ fullName(user) }}</strong>
                    <div class="admin-muted">{{ shortId(user.id_utilisateur) }}</div>
                  </div>
                </div>
              </td>
              <td><span class="admin-badge">{{ user.utilisateur?.role || '-' }}</span></td>
              <td>
                <span :class="['admin-badge', statusClass(user.utilisateur?.status_compte)]">
                  {{ formatStatus(user.utilisateur?.status_compte) }}
                </span>
              </td>
              <td class="admin-muted">{{ user.utilisateur?.email || '-' }}</td>
              <td class="admin-muted">{{ user.utilisateur?.ecole || '-' }}</td>
              <td class="admin-muted">{{ formatDate(user.utilisateur?.date_creation) }}</td>
              <td>
                <div class="admin-actions">
                  <button
                    class="admin-btn admin-btn--secondary admin-btn--sm"
                    type="button"
                    :disabled="user.utilisateur?.status_compte === 'ACTIF'"
                    @click="admin.updateUserStatus(user.id_utilisateur, 'ACTIF')"
                  >
                    Activer
                  </button>
                  <button
                    class="admin-btn admin-btn--danger admin-btn--sm"
                    type="button"
                    :disabled="user.utilisateur?.status_compte === 'SUSPENDU'"
                    @click="admin.updateUserStatus(user.id_utilisateur, 'SUSPENDU')"
                  >
                    Suspendre
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="admin-page__actions" style="margin-top: 14px;">
        <button class="admin-btn admin-btn--secondary admin-btn--sm" type="button" :disabled="currentPage === 1" @click="currentPage--">
          Precedent
        </button>
        <span class="admin-muted">Page {{ currentPage }} / {{ totalPages }}</span>
        <button class="admin-btn admin-btn--secondary admin-btn--sm" type="button" :disabled="currentPage === totalPages" @click="currentPage++">
          Suivant
        </button>
      </div>
    </article>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import { useAdminStore } from '../../stores/adminStore'

const admin = useAdminStore()
const searchQuery = ref('')
const roleFilter = ref('')
const currentPage = ref(1)
const perPage = 8

const activeStudentsCount = computed(() =>
  admin.users.filter(user =>
    user.utilisateur?.role === 'ETUDIANT' &&
    user.utilisateur?.status_compte === 'ACTIF'
  ).length
)

const filteredUsers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return admin.users.filter(user => {
    const name = fullName(user).toLowerCase()
    const email = (user.utilisateur?.email || '').toLowerCase()
    const role = user.utilisateur?.role || ''
    const matchesSearch = !query || name.includes(query) || email.includes(query) || role.toLowerCase().includes(query)
    const matchesRole = !roleFilter.value || role === roleFilter.value
    return matchesSearch && matchesRole
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredUsers.value.length / perPage))
)

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredUsers.value.slice(start, start + perPage)
})

watch([searchQuery, roleFilter], () => {
  currentPage.value = 1
})

function roleCount(role) {
  return admin.users.filter(user => user.utilisateur?.role === role).length
}

function fullName(user) {
  return admin.userFullName(user)
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
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

function shortId(id) {
  return id ? `ID ${id.slice(0, 8)}` : '-'
}

function initials(name) {
  return (name || '?')
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

onMounted(admin.fetchUsers)
</script>
