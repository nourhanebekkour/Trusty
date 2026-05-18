import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useAdminStore = defineStore('admin', () => {

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

  const loading = ref(false)
  const error   = ref(null)

  // ── Actions existantes ─────────────────────────────────

  async function fetchDashboardStats() {
    try {
      loading.value = true
      const res = await api.get('/admin/stats')
      stats.value = res.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Erreur lors du chargement des stats'
    } finally {
      loading.value = false
    }
  }

  async function fetchUsers() {
    try {
      loading.value = true
      const res = await api.get('/admin/users')
      users.value = res.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Erreur lors du chargement des utilisateurs'
    } finally {
      loading.value = false
    }
  }

  // ── createUser : crée via POST /api/auth/register ──────
  // Corps attendu : { email, password, nom, prenom, role, telephone? }
  // Rôles valides (enum Prisma) : ETUDIANT | PROFESSEUR | ADMINISTRATEUR | PROFESSIONNEL
  async function createUser(userData) {
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
      return {
        success: false,
        message: e.response?.data?.message || 'Erreur lors de la création'
      }
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
    try {
      await api.delete(`/admin/users/${id}`)
      users.value = users.value.filter(u => u.id_administrateur !== id)
    } catch (e) {
      error.value = e.response?.data?.message || 'Erreur lors de la suppression'
    }
  }

  // ── File de vérification ───────────────────────────────
  // GET /admin/verifications → Projets + Stages avec status_validation = EN_ATTENTE
  // Structure attendue par item :
  // {
  //   id: string,
  //   studentName: string,       ← prenom + nom de l'étudiant
  //   type: 'PROJET' | 'STAGE',
  //   description: string,       ← titre du projet ou poste du stage
  //   createdAt: string,         ← date_soumission
  // }
  async function fetchVerificationQueue() {
    try {
      loading.value = true
      const res = await api.get('/admin/verifications')
      verificationQueue.value = res.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Erreur lors du chargement de la file'
    } finally {
      loading.value = false
    }
  }

  async function certifyPortfolio(id) {
    try {
      await api.post(`/admin/portfolios/${id}/certify`)
      verificationQueue.value = verificationQueue.value.filter(p => p.id !== id)
      return { success: true }
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Erreur' }
    }
  }

  async function requestCorrections(id, note) {
    try {
      await api.post(`/admin/portfolios/${id}/corrections`, { note })
      return { success: true }
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Erreur' }
    }
  }

  // ── Historique des certifications ──────────────────────
  // GET /admin/certifications/history → HistoriqueValidation + HistoriqueAction
  // Structure attendue par item :
  // {
  //   id: string,
  //   validatorName: string,     ← prenom + nom du validateur
  //   actionLabel: string,       ← 'certifié' | 'validé' | 'rejeté'
  //   entityType: string,        ← 'projet' | 'stage' | 'portfolio'
  //   entityTitle: string,       ← titre de l'entité concernée
  //   targetName: string,        ← prenom + nom de l'étudiant cible
  //   createdAt: string,
  // }
  async function fetchCertHistory() {
    try {
      loading.value = true
      const res = await api.get('/admin/certifications/history')
      certHistory.value = res.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Erreur lors du chargement de l\'historique'
    } finally {
      loading.value = false
    }
  }

  async function fetchPortfolios() {
    try {
      loading.value = true
      const res = await api.get('/admin/portfolios')
      portfolios.value = res.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Erreur'
    } finally {
      loading.value = false
    }
  }

  return {
    users, verificationQueue, portfolios, certHistory, stats,
    loading, error,
    fetchDashboardStats, fetchUsers, createUser, deleteUser,
    fetchVerificationQueue, certifyPortfolio, requestCorrections,
    fetchPortfolios, fetchCertHistory,
  }
})