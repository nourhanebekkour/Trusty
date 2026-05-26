<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>Modifier le profil</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <!-- Champs Utilisateur (PATCH /utilisateurs/{id}) -->
        <p class="modal-section-label">Informations générales</p>
        <label>Prénom</label>
        <input v-model="form.prenom"    type="text" placeholder="Prénom" />
        <label>Nom</label>
        <input v-model="form.nom"       type="text" placeholder="Nom" />
        <label>Téléphone</label>
        <input v-model="form.telephone" type="text" placeholder="+212 6 ..." />

        <!-- Champs Etudiant (PUT /etudiants/{id}) -->
        <p class="modal-section-label" style="margin-top:1rem">Profil étudiant</p>
        <label>Ville</label>
        <input v-model="form.ville" type="text" placeholder="Fès, Maroc" />
        <label>Biographie</label>
        <textarea v-model="form.biographie" rows="3" placeholder="Quelques mots sur vous..."></textarea>
        <label>LinkedIn</label>
        <textarea v-model="form.linkedin_url" rows="1" placeholder="https://linkedin.com/in/..."></textarea>
        <label>GitHub</label>
        <textarea v-model="form.github_username" rows="1" placeholder="votre-username"></textarea>
        <label>Objectif professionnel</label>
        <textarea v-model="form.objectif_professionnel" rows="1" placeholder="Développeur fullstack, Data scientist..."></textarea>
      </div>

      <div class="modal-footer">
        <button class="btn-outline" @click="$emit('close')">Annuler</button>
        <button class="btn-primary" @click="$emit('save', form)" :disabled="saving">
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({ user: Object, saving: Boolean })
defineEmits(['close', 'save'])

// Initialisation du formulaire depuis les deux sources (Utilisateur + Etudiant)
const form = reactive({
  // Champs Utilisateur
  prenom:    props.user.prenom    ?? '',
  nom:       props.user.nom       ?? '',
  telephone: props.user.telephone ?? '',
  // Champs Etudiant
  ville:                  props.user.ville ?? props.user.etudiant?.ville ?? '',
  biographie:             props.user.etudiant?.biographie             ?? '',
  linkedin_url:           props.user.etudiant?.linkedin_url           ?? '',
  github_username:        props.user.etudiant?.github_username        ?? '',
  objectif_professionnel: props.user.etudiant?.objectif_professionnel ?? '',
})

// Resynchroniser si l'objet user change (ex : rechargement après sauvegarde)
watch(() => props.user, (u) => {
  form.prenom                 = u.prenom                         ?? ''
  form.nom                    = u.nom                            ?? ''
  form.telephone              = u.telephone                      ?? ''
  form.ville                  = u.ville ?? u.etudiant?.ville ?? ''
  form.biographie             = u.etudiant?.biographie           ?? ''
  form.linkedin_url           = u.etudiant?.linkedin_url         ?? ''
  form.github_username        = u.etudiant?.github_username      ?? ''
  form.objectif_professionnel = u.etudiant?.objectif_professionnel ?? ''
}, { deep: true })
</script>

<style scoped>
@import '@/assets/profile.css';
.modal-section-label {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: var(--color-text-secondary, #888);
  margin-bottom: .4rem;
}
</style>
