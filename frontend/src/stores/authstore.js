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
    isAdmin: (state) => state.user?.role === 'ADMINISTRATEUR',
    isEtudiant: (state) => state.user?.role === 'ETUDIANT',
  },

  actions: {
    async loginUser(credentials) {
      this.loading = true
      this.error = null

      try {
        const response = await loginRequest(credentials)
        const payload = response?.data ?? response
        const token = payload?.token

        this.token = token ?? null
        this.user = payload?.user ?? null

        if (token) {
          localStorage.setItem('token', token)
        }

        return { success: true }
      } catch (err) {
        this.error = err?.response?.data?.message || 'Erreur de connexion'
        return { success: false }
      } finally {
        this.loading = false
      }
    },

    async login(email, password) {
      const result = await this.loginUser({ email, password })
      if (result.success) {
        await this.fetchUser()
      }
      return result.success
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
        this.user = response?.data?.data ?? response?.data ?? response ?? null
      } catch {
        this.user = null
      }
    },

    async fetchUser() {
      await this.fetchProfile()
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')

      api.post('/auth/logout').catch(() => {})
    },
  },
})
