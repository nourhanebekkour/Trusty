import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,  // ← cookie envoyé automatiquement
  headers: {
    'Content-Type': 'application/json',
  },
  //Timeout global — évite les requêtes pendantes indéfiniment
  timeout: 10_000,
})

//  Intercepteur de requête
api.interceptors.request.use(
  (config) => {
    const allowedOrigin = new URL(import.meta.env.VITE_API_URL).origin
    const requestOrigin = new URL(config.baseURL + (config.url || '')).origin
    if (requestOrigin !== allowedOrigin) {
      return Promise.reject(new Error('Requête vers une origine non autorisée bloquée'))
    }

    delete config.headers['Authorization']

  
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
      config.headers['X-Requested-With'] = 'XMLHttpRequest'
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Intercepteur de réponse
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

    if (status === 401) {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    if (status === 403) {
      if (window.location.pathname !== '/403') {
        window.location.href = '/403'
      }
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