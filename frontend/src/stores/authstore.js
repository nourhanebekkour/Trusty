import { defineStore } from 'pinia'
import { authService } from '../services/auth.service.jgrs'
import api from '../api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,       
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'ADMINISTRATEUR',
    isEtudiant: (state) => state.user?.role === 'ETUDIANT'
  },

  actions: {

    // Login 
    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        await authService.login({ email, password })
        // Fetch user 
        await this.fetchUser()
        return true
      } catch (err) {
        this.error = err.response?.data?.message || 'Erreur connexion'
        return false
      } finally {
        this.loading = false
      }
    },

    // Register
    async register(data) {
      this.loading = true
      this.error = null
      try {
        await authService.register(data)
        return true
      } catch (err) {
        this.error = err.response?.data?.message || 'Erreur inscription'
        return false
      } finally {
        this.loading = false
      }
    },

    // Fetch user 
    async fetchUser() {
      try {
        const res = await authService.getMe()
        this.user = res.data
      } catch {
        this.user = null
      }
    },

    // Logout
    async logout() {
      try {
        await api.post('/auth/logout') 
      } catch {}
      this.user = null
    }
  }
})