import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authstore'
import api from '../services/api'

// ── Helper erreur API ──────────────────────────────────────────────────────────
function getErrorMessage(e) {
  return (
    e?.response?.data?.message ||
    e?.message ||
    'Erreur inconnue'
  )
}

export const useAdminStore = defineStore('admin', () => {

  const auth = useAuthStore()

  // ── Guard rôle (sans navigation) ───────────────────────────────────────────
  function isAdmin() {
    return auth.user?.role === 'ADMINISTRATEUR'
  }

  // ── State ──────────────────────────────────────────────
  const users             = ref([])
  const verificationQueue = ref([])
  const portfolios        = ref([])
  const certHistory       = ref([])

  const stats = ref({
    studentsActive:    0,
    portfoliosCreated: 0,
    professors:        0,
    partners:          0,
  })

  const loading          = ref(false)
  const error            = ref(null)
  const creatingUser     = ref(false)
  const certifyingId     = ref(null)

  // ── Actions ─────────────────────────────────────────────

  async function fetchDashboardStats() {
    if (!isAdmin()) {
      error.value = 'Accès refusé'
      return
    }
    try {
      loading.value = true
      const res = await api.get('/admin/stats')
      stats.value = res.data
    } catch (e) {
      error.value = getErrorMessage(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchUsers() {
    if (!isAdmin()) {
      error.value = 'Accès refusé'
      return
    }
    try {
      loading.value = true
      const res = await api.get('/admin/users')
      users.value = res.data
    } catch (e) {
      error.value = getErrorMessage(e)
    } finally {
      loading.value = false
    }
  }

  // ── createUser : crée via POST /api/auth/register ──────
  // Corps attendu : { email, password, nom, prenom, role, telephone? }
  // Rôles valides (enum Prisma) : ETUDIANT | PROFESSEUR | ADMINISTRATEUR | PROFESSIONNEL
  async function createUser(userData) {
    if (!isAdmin()) {
      return { success: false, message: 'Accès refusé' }
    }
    if (creatingUser.value) {
      return { success: false, message: 'Création déjà en cours' }
    }

    if (!userData?.email || !userData?.password || !userData?.firstName || !userData?.lastName) {
      return { success: false, message: 'Champs obligatoires manquants' }
    }

    creatingUser.value = true
    try {
      const payload = {
        email:    userData.email,
        password: userData.password,
        nom:      userData.lastName,
        prenom:   userData.firstName,
        role:     mapRoleToEnum(userData.role),
        ...(userData.phone && { telephone: userData.phone }),
      }

      const res = await api.post('/auth/register', payload)

      // Rafraîchir la liste après création
      await fetchUsers()

      return { success: true, data: res.data }
    } catch (e) {
      return { success: false, message: getErrorMessage(e) }
    } finally {
      creatingUser.value = false
    }
  }

  // Convertit le label français du select vers l'enum Prisma
  function mapRoleToEnum(label) {
    const map = {
      'Étudiant':       'ETUDIANT',
      'Professeur':     'PROFESSEUR',
      'Administrateur': 'ADMINISTRATEUR',
      'Professionnel':  'PROFESSIONNEL',
    }
    return map[label] || 'ETUDIANT'
  }

  async function deleteUser(id) {
    if (!isAdmin()) {
      error.value = 'Accès refusé'
      return
    }
    try {
      await api.delete(`/admin/users/${id}`)
      users.value = users.value.filter(u => u.id_administrateur !== id)
    } catch (e) {
      error.value = getErrorMessage(e)
    }
  }

  // ── File de vérification ───────────────────────────────
  // GET /admin/verifications → Projets + Stages avec status_validation = EN_ATTENTE
  async function fetchVerificationQueue() {
    if (!isAdmin()) {
      error.value = 'Accès refusé'
      return
    }
    try {
      loading.value = true
      const res = await api.get('/admin/verifications')
      verificationQueue.value = res.data
    } catch (e) {
      error.value = getErrorMessage(e)
    } finally {
      loading.value = false
    }
  }

  async function certifyPortfolio(id) {
    if (!isAdmin()) {
      return { success: false, message: 'Accès refusé' }
    }
    if (certifyingId.value === id) {
      return { success: false, message: 'Certification déjà en cours' }
    }
    certifyingId.value = id
    try {
      await api.post(`/admin/portfolios/${id}/certify`)
      verificationQueue.value = verificationQueue.value.filter(p => p.id !== id)
      return { success: true }
    } catch (e) {
      return { success: false, message: getErrorMessage(e) }
    } finally {
      certifyingId.value = null
    }
  }

  async function requestCorrections(id, note) {
    if (!isAdmin()) {
      return { success: false, message: 'Accès refusé' }
    }
    if (!note?.trim()) {
      return { success: false, message: 'Note de correction requise' }
    }
    try {
      await api.post(`/admin/portfolios/${id}/corrections`, { note })
      return { success: true }
    } catch (e) {
      return { success: false, message: getErrorMessage(e) }
    }
  }

  // ── Historique des certifications ──────────────────────
  async function fetchCertHistory() {
    if (!isAdmin()) {
      error.value = 'Accès refusé'
      return
    }
    try {
      loading.value = true
      const res = await api.get('/admin/certifications/history')
      certHistory.value = res.data
    } catch (e) {
      error.value = getErrorMessage(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchPortfolios() {
    if (!isAdmin()) {
      error.value = 'Accès refusé'
      return
    }
    try {
      loading.value = true
      const res = await api.get('/admin/portfolios')
      portfolios.value = res.data
    } catch (e) {
      error.value = getErrorMessage(e)
    } finally {
      loading.value = false
    }
  }

  return {
    users, verificationQueue, portfolios, certHistory, stats,
    loading, error, creatingUser, certifyingId,
    fetchDashboardStats, fetchUsers, createUser, deleteUser,
    fetchVerificationQueue, certifyPortfolio, requestCorrections,
    fetchPortfolios, fetchCertHistory,
  }
})