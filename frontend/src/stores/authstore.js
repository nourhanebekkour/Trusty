import { defineStore } from 'pinia'
import { authService } from '../services/auth.service.js'
import api from '../api'

// Évite de stocker des données sensibles renvoyées par erreur par l'API
const USER_ALLOWED_FIELDS = [
  'id', 'nom', 'prenom', 'email', 'role',
  'avatar', 'isVerified', 'createdAt',
]

const sanitizeUser = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  return USER_ALLOWED_FIELDS.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(raw, key)) {
      const val = raw[key]
      if (val === null || typeof val !== 'object') {
        acc[key] = val
      }
    }
    return acc
  }, Object.create(null)) 
}

const VALID_ROLES = ['ADMIN', 'ETUDIANT', 'PROFESSEUR', 'PROFESSIONNEL']
const isValidRole = (role) =>
  typeof role === 'string' && VALID_ROLES.includes(role.toUpperCase())

// Timeout utilitaire pour éviter qu'un appel réseau bloque indéfiniment
const withTimeout = (promise, ms = 8000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), ms)
    ),
  ])

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null,
    isInitialized: false, // évite les appels API répétés à chaque navigation
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin:         (state) => state.user?.role?.toUpperCase() === 'ADMIN',
    isEtudiant:      (state) => state.user?.role?.toUpperCase() === 'ETUDIANT',
    isProfesseur:    (state) => state.user?.role?.toUpperCase() === 'PROFESSEUR',
    isProfessionnel: (state) => state.user?.role?.toUpperCase() === 'PROFESSIONNEL',
  },

  actions: {
    // Login
    async login(email, password) {
      if (typeof email !== 'string' || typeof password !== 'string') {
        this.error = 'Données de connexion invalides'
        return false
      }

      this.loading = true
      this.error = null
      try {
        await withTimeout(authService.login({ email: email.trim(), password }))
        await this.fetchUser()
        return true
      } catch (err) {
        this.error = 'Email ou mot de passe invalide'
        if (import.meta.env.DEV) {
          console.error('[AuthStore] Login error:', err.response?.data?.message || err.message)
        }
        return false
      } finally {
        this.loading = false
      }
    },

    // Register
    async register(data) {
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        this.error = 'Données d\'inscription invalides'
        return false
      }

      this.loading = true
      this.error = null
      try {
        await withTimeout(authService.register(data))
        return true
      } catch (err) {
        this.error = 'Erreur lors de l\'inscription. Veuillez réessayer.'
        if (import.meta.env.DEV) {
          console.error('[AuthStore] Register error:', err.response?.data?.message || err.message)
        }
        return false
      } finally {
        this.loading = false
      }
    },

    // Fetch user
    async fetchUser() {
      try {
        const res = await withTimeout(authService.getMe())
        const rawUser = res?.data ?? res?.user ?? res ?? null

        const safeUser = sanitizeUser(rawUser)

        if (!safeUser) {
          this.user = null
          return
        }

        if (!isValidRole(safeUser.role)) {
          if (import.meta.env.DEV) {
            console.warn('[AuthStore] Rôle inattendu reçu:', safeUser.role)
          }
          this.user = null
          return
        }

        this.user = safeUser
      } catch {
        this.user = null
      } finally {
        this.isInitialized = true
      }
    },

    // Logout
    async logout() {
      try {
        await withTimeout(api.post('/auth/logout'))
      } catch {
        if (import.meta.env.DEV) {
          console.warn('[AuthStore] Logout API call failed, clearing local session anyway')
        }
      } finally {
        this.user = null
        this.error = null
        this.isInitialized = false
      }
    },
  },
})