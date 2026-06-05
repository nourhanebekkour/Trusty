import api from '@/api'

const projetService = {
  /** GET /api/projets/ */
  async getAll() {
    const { data } = await api.get('/projets/')
    return Array.isArray(data.data) ? data.data : []
  },

  /** POST /api/projets/ */
  async create(payload) {
    const { data } = await api.post('/projets/', payload)
    return data.data ?? null
  },

  /** PUT /api/projets/:id */
  async update(id, payload) {
    const { data } = await api.put(`/projets/${id}`, payload)
    return data.data ?? null
  },

  /** DELETE /api/projets/:id */
  async remove(id) {
    await api.delete(`/projets/${id}`)
  },
}

export default projetService