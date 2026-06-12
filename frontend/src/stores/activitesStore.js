import { defineStore } from 'pinia';
import { useAuthStore } from './authstore.js';
import { activitesService } from '../services/activitesService.js';

export const useActivitesStore = defineStore('activites', {
  state: () => ({
    activites: [],
    loading: false,
    error: null,
    activeFilter: 'Toutes',
  }),

  getters: {
    currentEtudiantId() {
      const authStore = useAuthStore();
      return authStore.user?.id_utilisateur ?? null;
    },

    filteredActivites(state) {
      if (!Array.isArray(state.activites)) return [];
      if (state.activeFilter === 'Toutes') return state.activites;
      return state.activites.filter(
        (a) => a.type_activite?.toLowerCase() === state.activeFilter.toLowerCase()
      );
    },

    totalActivites(state) {
      return Array.isArray(state.activites) ? state.activites.length : 0;
    },
    validees(state) {
      return Array.isArray(state.activites)
        ? state.activites.filter((a) => a.statut === 'VALIDE').length : 0;
    },
    enAttente(state) {
      return Array.isArray(state.activites)
        ? state.activites.filter((a) => a.statut === 'EN_ATTENTE').length : 0;
    },
    avecAttestation(state) {
      return Array.isArray(state.activites)
        ? state.activites.filter((a) => a.has_attestation).length : 0;
    },
  },

  actions: {
    async fetchActivites() {
      if (!this.currentEtudiantId) {
        this.activites = [];
        return;
      }
      this.loading = true;
      this.error = null;
      try {
        const result = await activitesService.getActivitesByEtudiant(this.currentEtudiantId);
        const items = Array.isArray(result) ? result : (result?.data ?? []);
        this.activites = Array.isArray(items) ? items.map(normalizeActivite) : [];
      } catch (e) {
        this.error = e.message;
        this.activites = [];
      } finally {
        this.loading = false;
      }
    },

    async addActivite(data) {
      if (!Array.isArray(this.activites)) this.activites = [];
      this.loading = true;
      try {
        const newActivite = await activitesService.createActivite(this.currentEtudiantId, data);
        const created = newActivite?.data ?? newActivite;
        this.activites.unshift(normalizeActivite(created));
      } catch (e) {
        this.error = e.response?.data?.message || "Erreur lors de la création de l'activité";
      } finally {
        this.loading = false;
      }
    },

    async updateActivite(id, data) {
      try {
        const updated = await activitesService.updateActivite(id, data);
        const idx = this.activites.findIndex((a) => a.id === id);
        if (idx !== -1) this.activites[idx] = updated;
      } catch {
        const idx = this.activites.findIndex((a) => a.id === id);
        if (idx !== -1) this.activites[idx] = { ...this.activites[idx], ...data };
      }
    },

    async removeActivite(id) {
      try {
        await activitesService.deleteActivite(id);
      } catch {}
      finally {
        this.activites = this.activites.filter((a) => a.id !== id);
      }
    },

    async uploadAttestation(id, file) {
      this.error = null;
      try {
        const result = await activitesService.uploadAttestation(id, file);
        await this.fetchActivites();
        return result;
      } catch (e) {
        this.error = e.response?.data?.message || e.message;
        throw e;
      }
    },

    async removeAttestation(id) {
      try {
        await activitesService.deleteAttestation(id);
        await this.fetchActivites();
      } catch (e) {
        this.error = e.response?.data?.message || e.message;
        throw e;
      }
    },

    setFilter(filter) {
      this.activeFilter = filter;
    },
  },
});

function normalizeActivite(activite) {
  return {
    ...activite,
    id: activite.id ?? activite.id_activite,
    statut: activite.statut ?? activite.status_validation,
    has_attestation: activite.has_attestation
      ?? Boolean(activite.id_attestation || activite.attestation),
  };
}
