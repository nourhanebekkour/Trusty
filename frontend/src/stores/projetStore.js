import { defineStore } from 'pinia'
import projetService from '@/services/projetService'

export const useProjetStore = defineStore('projets', {
  state: () => ({
    projets:   [],
    loading:   false,
    error:     null,
  }),

  getters: {
    stats: (state) => ({
      total:       state.projets.length,
      valides:     state.projets.filter(p => p.status_validation === 'VALIDE').length,
      enAttente:   state.projets.filter(p => p.status_validation === 'EN_ATTENTE').length,
      avecRapport: state.projets.filter(p => p.rapport || p.lien_github || p.lien_demo || p.lien_youtube).length,
    }),
  },

  actions: {
    async fetchProjets(idEtudiant) {
      this.loading = true
      this.error   = null
      try {
        this.projets = idEtudiant
          ? await projetService.getByEtudiant(idEtudiant)
          : await projetService.getAll()
      } catch (e) {
        this.error = e.response?.data?.message ?? e.message ?? 'Erreur lors du chargement'
      } finally {
        this.loading = false
      }
    },

    async getProjetById(id) {
      return await projetService.getById(id)
    },

    async createProjet(payload) {
      const created = await projetService.create(payload)
      if (created) this.projets.unshift(created)
      else await this.fetchProjets()
      return created
    },

    async updateProjet(id, payload) {
      const updated = await projetService.update(id, payload)
      if (updated) {
        const idx = this.projets.findIndex(p => p.id_projet === id)
        if (idx !== -1) this.projets.splice(idx, 1, updated)
      } else {
        await this.fetchProjets()
      }
      return updated
    },

    async deleteProjet(id) {
      await projetService.remove(id)
      this.projets = this.projets.filter(p => p.id_projet !== id)
    },

    clearError() {
      this.error = null
    },
  },
})
