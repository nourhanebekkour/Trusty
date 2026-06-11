import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',  // ✅ reste '/api'
  withCredentials: true,
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

// Intercepteur de réponse — avec refresh token automatique
api.interceptors.response.use(
  (response) => {
    const contentType = response.headers?.['content-type'] || ''
    if (response.data && !contentType.includes('application/json')) {
      console.warn('[API] Réponse non-JSON reçue, type:', contentType)
    }
    return response
  },
  async (error) => {
    const status = error.response?.status
    const originalRequest = error.config

    if (status === 401 && !originalRequest?._retry && window.location.pathname !== '/login') {
      originalRequest._retry = true
      try {
        await api.post('/auth/refresh-token')
        return api(originalRequest)
      } catch {
        window.location.href = '/login'
      }
    }

    if (status === 403) console.warn('[API] Accès interdit (403)')
    if (status === 429) console.warn('[API] Trop de requêtes envoyées.')
    if (!error.response) console.error('[API] Erreur réseau ou timeout')

    return Promise.reject(error)
  }
)

export default api