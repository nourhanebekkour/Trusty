import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authstore'
import api from '../services/api'

function getErrorMessage(e) {
  return e?.response?.data?.message || e?.message || 'Erreur inconnue'
}

function extractData(res) {
  const body = res?.data ?? res
  return body?.data ?? body
}

export const useAdminStore = defineStore('admin', () => {

  const auth = useAuthStore()

  function isAdmin() {
    return auth.user?.role === 'ADMINISTRATEUR'
  }

  const users             = ref([])
  const verificationQueue = ref([])
  const students          = ref([])
  const certHistory       = ref([])

  const stats = ref({
    studentsActive: 0,
    professors:     0,
    partners:       0,
  })

  const loading      = ref(false)
  const error        = ref(null)
  const creatingUser = ref(false)
  const validatingId = ref(null)

  async function fetchDashboardStats() {
    if (!isAdmin()) { error.value = 'Accès refusé'; return }
    try {
      loading.value = true
      const res = await api.get('/utilisateurs/')
      const data = extractData(res)
      if (Array.isArray(data)) {
        stats.value = {
          studentsActive: data.filter(u => u.role === 'ETUDIANT').length,
          professors:     data.filter(u => u.role === 'PROFESSEUR').length,
          partners:       data.filter(u => u.role === 'PROFESSIONNEL').length,
        }
      }
    } catch (e) {
      error.value = getErrorMessage(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchUsers() {
    if (!isAdmin()) { error.value = 'Accès refusé'; return }
    try {
      loading.value = true
      const res = await api.get('/utilisateurs/')
      users.value = extractData(res)
    } catch (e) {
      error.value = getErrorMessage(e)
    } finally {
      loading.value = false
    }
  }

  async function createUser(userData) {
    if (!isAdmin()) return { success: false, message: 'Accès refusé' }
    if (creatingUser.value) return { success: false, message: 'Création déjà en cours' }
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
      await api.post('/auth/register', payload)
      await fetchUsers()
      return { success: true }
    } catch (e) {
      return { success: false, message: getErrorMessage(e) }
    } finally {
      creatingUser.value = false
    }
  }

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
    if (!isAdmin()) { error.value = 'Accès refusé'; return }
    try {
      await api.delete(`/utilisateurs/${id}`)
      users.value = users.value.filter(u => u.id_utilisateur !== id && u.utilisateur?.id_utilisateur !== id)
    } catch (e) {
      error.value = getErrorMessage(e)
    }
  }

  async function updateUserRole(id, role) {
    if (!isAdmin()) return { success: false, message: 'Accès refusé' }
    try {
      await api.patch(`/utilisateurs/${id}/role`, { role })
      await fetchUsers()
      return { success: true }
    } catch (e) {
      return { success: false, message: getErrorMessage(e) }
    }
  }

  async function updateUserStatus(id, status) {
    if (!isAdmin()) return { success: false, message: 'Accès refusé' }
    try {
      await api.patch(`/utilisateurs/${id}/statut`, { status })
      await fetchUsers()
      return { success: true }
    } catch (e) {
      return { success: false, message: getErrorMessage(e) }
    }
  }

  async function fetchVerificationQueue() {
    if (!isAdmin()) { error.value = 'Accès refusé'; return }
    try {
      loading.value = true
      const [activitesRes, prosRes] = await Promise.allSettled([
        api.get('/activites/a-valider'),
        api.get('/professionnels/en-attente'),
      ])

      const activites = activitesRes.status === 'fulfilled' ? (extractData(activitesRes.value) ?? []) : []
      const pros      = prosRes.status      === 'fulfilled' ? (extractData(prosRes.value)      ?? []) : []

      const mappedActivites = (Array.isArray(activites) ? activites : []).map(a => ({
        id:          a.id_activite || a.id,
        type:        'ACTIVITE',
        title:       a.nom_activite || a.type_activite || 'Activité',
        author:      a.etudiant?.utilisateur?.nom ? `${a.etudiant.utilisateur.prenom || ''} ${a.etudiant.utilisateur.nom || ''}`.trim() : a.etudiant?.nom || 'Étudiant',
        description: a.description || '',
        date:        a.date_demande || a.date_creation || a.date_debut || '',
        entity:      a,
      }))

      const mappedPros = (Array.isArray(pros) ? pros : []).map(p => ({
        id:          p.id_professionnel || p.id,
        type:        'PROFESSIONNEL',
        title:       p.entreprise || 'Professionnel',
        author:      p.utilisateur?.nom ? `${p.utilisateur.prenom || ''} ${p.utilisateur.nom || ''}`.trim() : p.nom || 'Professionnel',
        description: p.poste || p.missions || '',
        date:        p.date_demande || p.date_creation || '',
        entity:      p,
      }))

      verificationQueue.value = [...mappedActivites, ...mappedPros]
    } catch (e) {
      error.value = getErrorMessage(e)
    } finally {
      loading.value = false
    }
  }

  async function validateEntity(type, id, decision, comment) {
    if (!isAdmin()) return { success: false, message: 'Accès refusé' }
    validatingId.value = id
    try {
      if (type === 'ACTIVITE') {
        await api.post(`/activites/${id}/valider`, { decision, ...(comment && { commentaire: comment }) })
      } else if (type === 'PROFESSIONNEL') {
        await api.patch(`/professionnels/${id}/valider`, { action: decision })
      }
      verificationQueue.value = verificationQueue.value.filter(v => !(v.id === id && v.type === type))
      return { success: true }
    } catch (e) {
      return { success: false, message: getErrorMessage(e) }
    } finally {
      validatingId.value = null
    }
  }

  async function fetchCertHistory() {
    if (!isAdmin()) { error.value = 'Accès refusé'; return }
    try {
      loading.value = true
      const res = await api.get('/historique-actions/')
      certHistory.value = extractData(res)
    } catch (e) {
      error.value = getErrorMessage(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchStudents() {
    if (!isAdmin()) { error.value = 'Accès refusé'; return }
    try {
      loading.value = true
      const res = await api.get('/etudiants/')
      students.value = extractData(res)
    } catch (e) {
      error.value = getErrorMessage(e)
    } finally {
      loading.value = false
    }
  }

  return {
    users, verificationQueue, students, certHistory, stats,
    loading, error, creatingUser, validatingId,
    fetchDashboardStats, fetchUsers, createUser, deleteUser,
    updateUserRole, updateUserStatus,
    fetchVerificationQueue, validateEntity,
    fetchCertHistory, fetchStudents,
  }
})
