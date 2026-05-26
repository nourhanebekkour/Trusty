import api from '@/services/api'

export const login = (credentials) => api.post('/auth/login', credentials)
export const register = (userData) => api.post('/auth/register', userData)
export const getProfile = () => api.get('/auth/profile')
export const getAllUsers = () => api.get('/users')
export const updateProfile = (id, data) => api.put(`/users/${id}`, data)
export const patchProfile = (id, data) => api.patch(`/users/${id}`, data)
export const deleteUser = (id) => api.delete(`/users/${id}`)
