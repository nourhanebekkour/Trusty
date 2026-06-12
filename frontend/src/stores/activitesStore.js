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
        ? state.activites.filter((a) => a.statut === 'VALIDEE').length : 0;
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
        this.activites = Array.isArray(result) ? result : (Array.isArray(result?.data) ? result.data : []);
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
        this.activites.unshift(newActivite);
      } catch (e) {
        this.activites.unshift({
          id: Date.now().toString(),
          ...data,
          statut: 'EN_ATTENTE',
          has_attestation: false,
          est_public: data.est_public ?? true,
        });
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
      try {
        await activitesService.uploadAttestation(id, file);
      } catch {}
      finally {
        const idx = this.activites.findIndex((a) => a.id === id);
        if (idx !== -1) this.activites[idx].has_attestation = true;
      }
    },

    async removeAttestation(id) {
      try {
        await activitesService.deleteAttestation(id);
      } catch {}
      const idx = this.activites.findIndex((a) => a.id === id);
      if (idx !== -1) this.activites[idx].has_attestation = false;
    },

    setFilter(filter) {
      this.activeFilter = filter;
    },
  },
});

function getDemoActivites() {
  return [
    {
      id: '1',
      type_activite: 'EVENEMENT',
      nom_activite: 'Forum Entreprises ENSA 2024',
      organisation: 'ENSA Tanger',
      role: 'Coordinateur logistique',
      description: "Coordination de l'accueil des entreprises partenaires.",
      date_debut: '2024-04-01',
      date_fin: '2024-04-30',
      statut: 'EN_ATTENTE',
      has_attestation: false,
      est_public: true,
    },
    {
      id: '2',
      type_activite: 'HACKATHON',
      nom_activite: 'Hackathon IA Maroc 2024',
      organisation: 'Technopark Tanger',
      role: 'Participant',
      description: 'Développement d\'une solution IA en 48h. Classé 2ème sur 30 équipes.',
      date_debut: '2024-03-01',
      date_fin: '2024-03-31',
      statut: 'VALIDEE',
      has_attestation: true,
      est_public: true,
    },
  ];
}