import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})


//api.interceptors.request.use((config) => {
//  const token = localStorage.getItem('token')
//  if (token) {
//    config.headers.Authorization = `Bearer ${token}`
//  }
//  return config
//})

// ← PAS d'interceptor response qui redirige
// La redirection est gérée par le router guard uniquement

export default api