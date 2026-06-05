<template>
  <transition name="modal-fade">
    <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ editMode ? 'Modifier le projet' : 'Nouveau Projet' }}</h3>
          <button class="modal-close" @click="$emit('update:modelValue', false)">×</button>
        </div>

        <div class="modal-body">
          <div v-if="modalError" class="modal-error">{{ modalError }}</div>

          <div class="form-group">
            <label class="form-label">Titre *</label>
            <input v-model="localForm.titre" type="text" class="form-input"
                   placeholder="Ex: Système de gestion…" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Type *</label>
              <select v-model="localForm.type_projet" class="form-input">
                <option value="">Sélectionner…</option>
                <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Date de début *</label>
              <input v-model="localForm.date_debut" type="date" class="form-input" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Date de fin</label>
              <input v-model="localForm.date_fin" type="date" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Nb. collaborateurs</label>
              <input v-model.number="localForm.nombre_collaborateurs" type="number"
                     min="1" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Description *</label>
            <textarea v-model="localForm.description" class="form-input form-textarea"
                      rows="3" placeholder="Décrivez votre projet…"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Lien GitHub</label>
              <input v-model="localForm.lien_github" type="url" class="form-input"
                     placeholder="https://github.com/…" />
            </div>
            <div class="form-group">
              <label class="form-label">Lien Demo</label>
              <input v-model="localForm.lien_demo" type="url" class="form-input"
                     placeholder="https://…" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Lien YouTube</label>
              <input v-model="localForm.lien_youtube" type="url" class="form-input"
                     placeholder="https://youtube.com/…" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Résultats obtenus</label>
            <textarea v-model="localForm.resultats_obtenus" class="form-input form-textarea"
                      rows="2" placeholder="Résultats, métriques…"></textarea>
          </div>

          <div class="form-group">
            <label class="form-label form-label-inline">
              <input v-model="localForm.est_public" type="checkbox" class="form-checkbox" />
              Rendre ce projet public
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="$emit('update:modelValue', false)">Annuler</button>
          <button
            class="btn-submit"
            :disabled="submitting || !isFormValid"
            @click="handleSubmit"
          >
            <span v-if="submitting" class="btn-spinner"></span>
            {{ editMode ? 'Enregistrer' : 'Soumettre' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { emptyForm } from './projetHelpers'

export default {
  name: 'ProjetFormModal',

  props: {
    modelValue: { type: Boolean, default: false },
    editMode:   { type: Boolean, default: false },
    initialForm:{ type: Object,  default: () => emptyForm() },
    submitting: { type: Boolean, default: false },
    modalError: { type: String,  default: null },
  },

  emits: ['update:modelValue', 'submit'],

  data() {
    return {
      localForm: { ...this.initialForm },
      typeOptions: [
        { value: 'MODULE',      label: 'Module' },
        { value: 'INTEGRATION', label: 'Intégration' },
        { value: 'PFA',         label: 'PFA' },
        { value: 'PFE',         label: 'PFE' },
        { value: 'HACKATHON',   label: 'Hackathon' },
        { value: 'PERSONNEL',   label: 'Personnel' },
        { value: 'STAGE',       label: 'Stage' },
        { value: 'AUTRE',       label: 'Autre' },
      ],
    }
  },

  computed: {
    isFormValid() {
      return this.localForm.titre
        && this.localForm.type_projet
        && this.localForm.date_debut
        && this.localForm.description
    },
  },

  watch: {
    initialForm(val) {
      this.localForm = { ...val }
    },
  },

  methods: {
    handleSubmit() {
      this.$emit('submit', { ...this.localForm })
    },
  },
}
</script>
<style scoped>
   @import "@/assets/projet"
</style>