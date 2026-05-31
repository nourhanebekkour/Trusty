import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import api from '../services/api'

function extractData(response) {
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.data?.data)) return response.data.data
  return response?.data?.data ?? response?.data ?? []
}

function normalizeUser(user) {
  const flatUser = user?.utilisateur ? user.utilisateur : user
  const id = user?.id_administrateur || user?.id_utilisateur || flatUser?.id_utilisateur

  return {
    id_administrateur: id,
    id_utilisateur: id,
    niveau_acces: user?.niveau_acces || flatUser?.role || user?.role,
    role: flatUser?.role || user?.role,
    utilisateur: {
      ...flatUser,
      id_utilisateur: id,
      role: flatUser?.role || user?.role,
    },
    raw: user,
  }
}

function userFullName(user) {
  const u = user?.utilisateur || user || {}
  return `${u.prenom || ''} ${u.nom || ''}`.trim() || 'Utilisateur'
}

function normalizeActivity(activity) {
  const etudiant = activity?.etudiant || {}
  const utilisateur = etudiant?.utilisateur || {}
  const studentName = `${utilisateur.prenom || ''} ${utilisateur.nom || ''}`.trim()

  return {
    id: activity.id_activite,
    type: 'ACTIVITE',
    title: activity.nom_activite || 'Activite parascolaire',
    studentName: studentName || `Etudiant ${activity.id_etudiant?.slice?.(-4) || ''}`,
    description: activity.description || activity.role || activity.organisation || 'Activite a verifier',
    createdAt: activity.date_soumission,
    status: activity.status_validation,
    source: 'activites',
    raw: activity,
  }
}

function normalizeProfessional(professional) {
  const utilisateur = professional?.utilisateur || {}
  const name = `${utilisateur.prenom || ''} ${utilisateur.nom || ''}`.trim()
  const company = professional.entreprise || 'Entreprise non renseignee'
  const job = professional.poste || professional.secteur_activite || 'Profil professionnel'

  return {
    id: professional.id_professionnel,
    type: 'PROFESSIONNEL',
    title: company,
    studentName: name || `Professionnel ${professional.id_professionnel?.slice?.(-4) || ''}`,
    description: job,
    createdAt: professional.date_demande,
    status: professional.status_validation,
    source: 'professionnels',
    raw: professional,
  }
}

function normalizeHistory(action) {
  const user = action?.utilisateur || action?.validateur || {}
  const actor = `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Administrateur'
  return {
    id: action.id_historique || action.id_validation || `${action.entite_concernee}-${action.id_entite}`,
    validatorName: actor,
    actionLabel: action.type_action?.toLowerCase?.() || action.status_validation?.toLowerCase?.() || 'action',
    entityType: action.entite_concernee || action.type_entite || 'entite',
    entityTitle: action.details || action.id_entite || 'Element',
    targetName: actor,
    createdAt: action.date_action || action.date_decision || action.date_soumission,
    raw: action,
  }
}

function formatApiError(error, fallback) {
  const errors = error.response?.data?.errors
  if (Array.isArray(errors) && errors.length > 0) {
    return errors.map(item => item.message).join(' ')
  }

  if (error.response?.status === 403) {
    return "Action refusee par le backend. Verifiez le role et le niveau d'acces du compte connecte."
  }

  return error.response?.data?.message || fallback
}

export const useAdminStore = defineStore('admin', () => {
  const users = ref([])
  const verificationQueue = ref([])
  const portfolios = ref([])
  const certHistory = ref([])
  const loading = ref(false)
  const error = ref(null)

  const stats = computed(() => {
    const activeUsers = users.value.filter(user => user.utilisateur?.status_compte === 'ACTIF')
    return {
      studentsActive: activeUsers.filter(user => user.utilisateur?.role === 'ETUDIANT').length,
      portfoliosCreated: portfolios.value.length,
      professors: users.value.filter(user => user.utilisateur?.role === 'PROFESSEUR').length,
      partners: users.value.filter(user => user.utilisateur?.role === 'PROFESSIONNEL').length,
    }
  })

  async function runWithLoading(action, fallbackMessage) {
    loading.value = true
    error.value = null
    try {
      return await action()
    } catch (e) {
      error.value = e.response?.data?.message || fallbackMessage
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchDashboardStats() {
    await runWithLoading(async () => {
      const [usersResponse, queueResponse] = await Promise.all([
        api.get('/utilisateurs'),
        Promise.allSettled([
          api.get('/activites/a-valider'),
          api.get('/professionnels/en-attente'),
        ]),
      ])

      users.value = extractData(usersResponse).map(normalizeUser)

      const [activitiesResult, professionalsResult] = queueResponse
      const activities = activitiesResult.status === 'fulfilled'
        ? extractData(activitiesResult.value).map(normalizeActivity)
        : []
      const professionals = professionalsResult.status === 'fulfilled'
        ? extractData(professionalsResult.value).map(normalizeProfessional)
        : []

      verificationQueue.value = [...activities, ...professionals]
    }, 'Erreur lors du chargement des statistiques')
  }

  async function fetchUsers() {
    const data = await runWithLoading(async () => {
      const response = await api.get('/utilisateurs')
      return extractData(response).map(normalizeUser)
    }, 'Erreur lors du chargement des utilisateurs')

    if (data) users.value = data
  }

  async function createUser(userData) {
    try {
      const role = mapRoleToEnum(userData.role)
      const basePayload = {
        email: userData.email,
        nom: userData.lastName,
        prenom: userData.firstName,
      }

      let response
      if (role === 'ADMINISTRATEUR') {
        response = await api.post('/auth/admin/create-user', {
          ...basePayload,
          niveau_acces: userData.niveau_acces || 'ADMIN',
          ...(userData.niveau_acces !== 'SUPER_ADMIN' && userData.ecole && { ecole: userData.ecole }),
        })
      } else {
        response = await api.post('/auth/register', {
          ...basePayload,
          password: userData.password,
          role,
          ...(role !== 'PROFESSIONNEL' && userData.ecole && { ecole: userData.ecole }),
        })
      }

      await fetchUsers()
      return { success: true, data: extractData(response) }
    } catch (e) {
      return {
        success: false,
        message: formatApiError(e, 'Erreur lors de la creation'),
      }
    }
  }

  function mapRoleToEnum(label) {
    const map = {
      Etudiant: 'ETUDIANT',
      Professeur: 'PROFESSEUR',
      Administrateur: 'ADMINISTRATEUR',
      Professionnel: 'PROFESSIONNEL',
      ETUDIANT: 'ETUDIANT',
      PROFESSEUR: 'PROFESSEUR',
      ADMINISTRATEUR: 'ADMINISTRATEUR',
      PROFESSIONNEL: 'PROFESSIONNEL',
    }
    return map[label] || 'ETUDIANT'
  }

  async function deleteUser(id) {
    await runWithLoading(async () => {
      await api.delete(`/utilisateurs/${id}`)
      users.value = users.value.filter(user => user.id_utilisateur !== id)
    }, 'Erreur lors de la suppression')
  }

  async function updateUserStatus(id, status) {
    await runWithLoading(async () => {
      await api.patch(`/utilisateurs/${id}/statut`, { status })
      users.value = users.value.map(user =>
        user.id_utilisateur === id
          ? { ...user, utilisateur: { ...user.utilisateur, status_compte: status } }
          : user
      )
    }, 'Erreur lors de la mise a jour du statut')
  }

  async function updateUserRole(id, role) {
    await runWithLoading(async () => {
      await api.patch(`/utilisateurs/${id}/role`, { role })
      users.value = users.value.map(user =>
        user.id_utilisateur === id
          ? {
              ...user,
              role,
              niveau_acces: role,
              utilisateur: { ...user.utilisateur, role },
            }
          : user
      )
    }, 'Erreur lors de la mise a jour du role')
  }

  async function fetchVerificationQueue() {
    await runWithLoading(async () => {
      const [activitiesResult, professionalsResult] = await Promise.allSettled([
        api.get('/activites/a-valider'),
        api.get('/professionnels/en-attente'),
      ])

      const activities = activitiesResult.status === 'fulfilled'
        ? extractData(activitiesResult.value).map(normalizeActivity)
        : []
      const professionals = professionalsResult.status === 'fulfilled'
        ? extractData(professionalsResult.value).map(normalizeProfessional)
        : []

      verificationQueue.value = [...activities, ...professionals]
    }, 'Erreur lors du chargement de la file de verification')
  }

  async function validateVerification(itemOrId, decision = 'VALIDE', commentaire = '') {
    const item = typeof itemOrId === 'string'
      ? verificationQueue.value.find(entry => entry.id === itemOrId)
      : itemOrId

    if (!item) {
      return { success: false, message: 'Element introuvable' }
    }

    try {
      if (item.source === 'activites') {
        await api.post(`/activites/${item.id}/valider`, { decision, commentaire })
      } else if (item.source === 'professionnels') {
        await api.patch(`/professionnels/${item.id}/valider`, { action: decision })
      } else {
        throw new Error('Type de verification non supporte')
      }

      verificationQueue.value = verificationQueue.value.filter(entry => entry.id !== item.id)
      return { success: true }
    } catch (e) {
      return {
        success: false,
        message: e.response?.data?.message || e.message || 'Erreur',
      }
    }
  }

  async function certifyPortfolio(id) {
    return {
      success: false,
      message: `API manquante pour certifier le portfolio ${id}. Voir API_CONTRACT_ADMIN_PROFESSIONAL.md.`,
    }
  }

  async function requestCorrections(id, note) {
    return {
      success: false,
      message: `API manquante pour demander des corrections sur le portfolio ${id}. Note: ${note || '-'}`,
    }
  }

  async function fetchCertHistory() {
    const data = await runWithLoading(async () => {
      const response = await api.get('/historique-actions')
      return extractData(response).map(normalizeHistory)
    }, "Erreur lors du chargement de l'historique")

    if (data) certHistory.value = data
  }

  async function fetchPortfolios() {
    portfolios.value = []
    return []
  }

  return {
    users,
    verificationQueue,
    portfolios,
    certHistory,
    stats,
    loading,
    error,
    userFullName,
    fetchDashboardStats,
    fetchUsers,
    createUser,
    deleteUser,
    updateUserStatus,
    updateUserRole,
    fetchVerificationQueue,
    validateVerification,
    certifyPortfolio,
    requestCorrections,
    fetchPortfolios,
    fetchCertHistory,
  }
})
