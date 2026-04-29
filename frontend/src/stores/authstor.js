import { defineStore } from 'pinia'
import { login, getProfile } from '../services/authservices'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  actions: {
    async loginUser(credentials) {
      this.loading = true
      this.error = null
      try {
        const response = await login(credentials)
        this.token = response.data.token
        this.user = response.data.user
        localStorage.setItem('token', this.token)
      } catch (err) {
        this.error = err.response?.data?.message || 'Erreur de connexion'
      } finally {
        this.loading = false
      }
    },

    async fetchProfile() {
      try {
        const response = await getProfile()
        this.user = response.data
      } catch (err) {
        console.error(err)
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
    }
  }
})