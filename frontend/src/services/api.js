import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',  // ✅ reste '/api'
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur de requête
api.interceptors.request.use(
  (config) => {
    // ✅ Supprimé complètement — new URL('/api') est invalide avec une URL relative
    // La sécurité d'origine est déjà gérée par le proxy Vite dans vite.config.js

    delete config.headers['Authorization']

    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
      config.headers['X-Requested-With'] = 'XMLHttpRequest'
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Intercepteur de réponse — inchangé
api.interceptors.response.use(
  (response) => {
    const contentType = response.headers?.['content-type'] || ''
    if (response.data && !contentType.includes('application/json')) {
      console.warn('[API] Réponse non-JSON reçue, type:', contentType)
    }
    return response
  },
  (error) => {
    const status = error.response?.status

    if (status === 401 && window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
    if (status === 403 && window.location.pathname !== '/403') {
      window.location.href = '/403'
    }
    if (status === 429) {
      console.warn('[API] Trop de requêtes envoyées.')
    }
    if (!error.response) {
      console.error('[API] Erreur réseau ou timeout')
    }

    return Promise.reject(error)
  }
)

export default api