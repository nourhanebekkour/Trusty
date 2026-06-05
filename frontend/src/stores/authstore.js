import { defineStore } from 'pinia'
import { getProfile, login as loginRequest } from '@/services/authservices'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin:         (state) => state.user?.role === 'ADMINISTRATEUR',
    isEtudiant:      (state) => state.user?.role === 'ETUDIANT',
    isProfesseur:    (state) => state.user?.role === 'PROFESSEUR',
    isProfessionnel: (state) => state.user?.role === 'PROFESSIONNEL',

    homeRoute: (state) => {
      switch (state.user?.role) {
        case 'ADMINISTRATEUR': return '/admin/dashboard'
        case 'ETUDIANT':       return '/dashboard'
        case 'PROFESSIONNEL':  return '/professional/dashboard'
        case 'PROFESSEUR':     return '/professor'
        default:               return '/'
      }
    },
  },

  actions: {
    async loginUser(credentials) {
      this.loading = true
      this.error = null

      try {
        const response = await loginRequest(credentials)
        const payload  = response?.data ?? response
        const data     = payload?.data ?? payload

        // Token peut être dans le body ou en cookie HttpOnly (auquel cas il est null ici)
        const token = data?.token ?? data?.accessToken ?? null
        const user  = data?.user  ?? data?.utilisateur ?? null

        if (token) {
          this.token = token
          localStorage.setItem('token', token)
        }

        // Si pas de user dans le body (cookie-based), on le fetch immédiatement
        if (user) {
          this.user = user
        } else {
          await this.fetchProfile()
        }

        return { success: true }
      } catch (err) {
        this.error = err?.response?.data?.message || 'Erreur de connexion'
        return { success: false }
      } finally {
        this.loading = false
      }
    },

    async register(data) {
      this.loading = true
      this.error = null
      try {
        await api.post('/auth/register', data)
        return true
      } catch (err) {
        this.error = err?.response?.data?.message || 'Erreur inscription'
        return false
      } finally {
        this.loading = false
      }
    },

    async fetchProfile() {
      try {
        const response = await getProfile()
        const payload  = response?.data ?? response
        // Backend: { status, success, data: { user: {...} } }
        this.user = payload?.data?.user ?? payload?.data ?? payload ?? null
      } catch {
        this.user = null
      }
    },

    async fetchUser() {
      await this.fetchProfile()
    },

    logout() {
      this.user  = null
      this.token = null
      localStorage.removeItem('token')
      api.post('/auth/logout').catch(() => {})
    },

    async verifyEmail(token) {
      this.loading = true
      this.error = null
      try {
        await api.post('/auth/verify-email', { token })
        return true
      } catch (err) {
        this.error = err?.response?.data?.message || 'Erreur lors de la vérification'
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})