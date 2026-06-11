import api from '@/api'

const projetService = {
  async getAll() {
    const { data } = await api.get('/projets/')
    return Array.isArray(data.data) ? data.data : []
  },

  async getById(id) {
    const { data } = await api.get(`/projets/${id}`)
    return data.data ?? null
  },

  async create(payload) {
    const { data } = await api.post('/projets/', payload)
    return data.data ?? null
  },

  async update(id, payload) {
    const { data } = await api.put(`/projets/${id}`, payload)
    return data.data ?? null
  },

  async remove(id) {
    await api.delete(`/projets/${id}`)
  },
}

export default projetService
