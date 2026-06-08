import api from '../api.js'

const SECURITY = {
  REGISTER_ALLOWED_FIELDS: ['nom', 'prenom', 'email', 'password', 'role'],

  MAX_EMAIL_LENGTH: 254,
  MAX_PASSWORD_LENGTH: 128,
  MAX_TOKEN_LENGTH: 512,
}

const sanitizeString = (value, maxLength = 255) => {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

const pickAllowedFields = (data, allowedFields) => {
  return allowedFields.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      acc[key] = data[key]
    }
    return acc
  }, {})
}

const normalizeEmail = (email) =>
  sanitizeString(email, SECURITY.MAX_EMAIL_LENGTH).toLowerCase()

export const authService = {

  // POST /api/auth/register
  async register(data) {
    const safeData = pickAllowedFields(data, SECURITY.REGISTER_ALLOWED_FIELDS)

    if (safeData.email) {
      safeData.email = normalizeEmail(safeData.email)
    }
    if (safeData.password) {
      safeData.password = sanitizeString(safeData.password, SECURITY.MAX_PASSWORD_LENGTH)
    }

    const response = await api.post('/auth/register', safeData)
    return response.data
  },

  // POST /api/auth/login
  async login(credentials) {
    const safeCredentials = {
      email: normalizeEmail(credentials.email ?? ''),
      password: sanitizeString(credentials.password ?? '', SECURITY.MAX_PASSWORD_LENGTH),
    }

    if (!safeCredentials.email || !safeCredentials.password) {
      throw new Error('Identifiants invalides')
    }

    const response = await api.post('/auth/login', safeCredentials)
    return response.data
  },

  // GET /api/auth/me
  async getMe() {
    const response = await api.get('/auth/me')
    return response.data
  },

  // POST /api/auth/forgot-password
  async forgotPassword(email) {
    const safeEmail = normalizeEmail(email ?? '')

    if (!safeEmail) {
      throw new Error('Email requis')
    }

    const response = await api.post('/auth/forgot-password', { email: safeEmail })
    return response.data
  },

  // POST /api/auth/reset-password
  async resetPassword(token, nouveauMotDePasse) {
    const safeToken = sanitizeString(token ?? '', SECURITY.MAX_TOKEN_LENGTH)
    const safePassword = sanitizeString(nouveauMotDePasse ?? '', SECURITY.MAX_PASSWORD_LENGTH)

    if (!safeToken || !safePassword) {
      throw new Error('Token ou mot de passe manquant')
    }

    const response = await api.post('/auth/reset-password', {
      token: safeToken,
      nouveauMotDePasse: safePassword,
    })
    return response.data
  },

  // POST /api/auth/verify-email
  async verifyEmail(token) {
    const response = await api.post('/auth/verify-email', { token })
    return response.data
  }
}
