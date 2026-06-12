// src/services/activitesService.js
import api from '../api.js'; // ← ton instance axios centralisée

const BASE_URL = '/activites'; // plus besoin de /api, baseURL le gère

export const activitesService = {
  async getActivitesByEtudiant(idEtudiant) {
    const res = await api.get(`${BASE_URL}/etudiant/${idEtudiant}`);
    return res.data;
  },

  async getAllActivites() {
    const res = await api.get(`${BASE_URL}/`);
    return res.data;
  },

  async getActiviteById(id) {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
  },

  async createActivite(idEtudiant, data) {
    const res = await api.post(`${BASE_URL}/etudiant/${idEtudiant}`, data);
    return res.data;
  },

  async updateActivite(id, data) {
    const res = await api.put(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async deleteActivite(id) {
    const res = await api.delete(`${BASE_URL}/${id}`);
    return res.data;
  },

  async uploadAttestation(id, fichier) {
    const form = new FormData();
    form.append('fichier', fichier);
    const res = await api.post(`${BASE_URL}/${id}/attestation`, form);
    return res.data;
  },

  async deleteAttestation(id) {
    const res = await api.delete(`${BASE_URL}/${id}/attestation`);
    return res.data;
  },
};
