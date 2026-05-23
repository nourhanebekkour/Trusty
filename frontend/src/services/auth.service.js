import api from './api.js'

export const authService = {

  // POST /api/auth/register
  async register(data) {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  // POST /api/auth/login 
  async login(credentials) {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  // GET /api/auth/me 
  async getMe() {
    const response = await api.get('/auth/me')
    return response.data
  },

  // POST /api/auth/forgot-password
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  // POST /api/auth/reset-password
  async resetPassword(token, nouveauMotDePasse) {
    const response = await api.post('/auth/reset-password', {
      token,
      nouveauMotDePasse
    })
    return response.data
  }
}