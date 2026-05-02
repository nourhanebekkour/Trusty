import api from './api'

// ── POST ──────────────────────────────
export const login = (credentials) => {
  // credentials = { email, password }
  return api.post('/auth/login', credentials)
}

export const register = (userData) => {
  // userData = { name, email, password }
  return api.post('/auth/register', userData)
}

// ── GET ───────────────────────────────
export const getProfile = () => {
  return api.get('/auth/profile')
}

export const getAllUsers = () => {
  return api.get('/users')
}

// ── PUT / PATCH ───────────────────────
export const updateProfile = (id, data) => {
  return api.put(`/users/${id}`, data)       // full update
}

export const patchProfile = (id, data) => {
  return api.patch(`/users/${id}`, data)     // partial update
}

// ── DELETE ────────────────────────────
export const deleteUser = (id) => {
  return api.delete(`/users/${id}`)
}