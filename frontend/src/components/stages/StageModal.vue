<template>
  <Teleport to="body">
    <div v-if="store.modal.open" class="modal-overlay" @click.self="store.modal.open = false">
      <div class="modal">

        <div class="modal-header">
          <h2>{{ store.modal.mode === 'create' ? 'Nouveau stage' : 'Modifier le stage' }}</h2>
          <button class="modal-close" @click="store.modal.open = false">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Entreprise *</label>
              <input v-model="store.form.entreprise" class="form-input" placeholder="ex: TechFlow Solutions" />
            </div>
            <div class="form-group">
              <label>Poste *</label>
              <input v-model="store.form.poste" class="form-input" placeholder="ex: Développeur Full Stack" />
            </div>
            <div class="form-group">
              <label>Adresse entreprise</label>
              <input v-model="store.form.adresse_entreprise" class="form-input" placeholder="ex: Casablanca, Maroc" />
            </div>
            <div class="form-group">
              <label>Encadrant professionnel</label>
              <input v-model="store.form.encadrant_professionnel" class="form-input" placeholder="Nom de l'encadrant" />
            </div>
            <div class="form-group">
              <label>Encadrant académique</label>
              <input v-model="store.form.encadrant_academique" class="form-input" placeholder="Nom du tuteur" />
            </div>
            <div class="form-group">
              <label>Durée (semaines)</label>
              <input v-model.number="store.form.duree_semaines" type="number" class="form-input" placeholder="ex: 8" />
            </div>
            <div class="form-group">
              <label>Date de début *</label>
              <input v-model="store.form.date_debut" type="date" class="form-input" />
            </div>
            <div class="form-group">
              <label>Date de fin</label>
              <input v-model="store.form.date_fin" type="date" class="form-input" />
            </div>
            <div class="form-group form-group--full">
              <label>Missions *</label>
              <textarea v-model="store.form.missions" class="form-input form-textarea" placeholder="Décrivez vos missions..."></textarea>
            </div>
            <div class="form-group">
              <label>Visibilité</label>
              <select v-model="store.form.est_public" class="form-input">
                <option :value="true">Public</option>
                <option :value="false">Privé</option>
              </select>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="store.modal.open = false">Annuler</button>
          <button class="btn-new" :disabled="store.saving" @click="store.sauvegarder()">
            {{ store.saving ? 'Enregistrement...' : (store.modal.mode === 'create' ? 'Créer le stage' : 'Enregistrer') }}
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useStageStore } from '@/stores/stageStore'
const store = useStageStore()
</script>

<style scoped>
@import '@/assets/StageList.css';
</style>