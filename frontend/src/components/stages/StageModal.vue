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
              <input v-model="store.form.entreprise"         class="form-input" placeholder="ex: TechFlow Solutions"      maxlength="150" />
            </div>
            <div class="form-group">
              <label>Poste *</label>
              <input v-model="store.form.poste"              class="form-input" placeholder="ex: Développeur Full Stack"  maxlength="150" />
            </div>
            <div class="form-group">
              <label>Adresse entreprise</label>
              <input v-model="store.form.adresse_entreprise" class="form-input" placeholder="ex: Casablanca, Maroc"       maxlength="200" />
            </div>
            <div class="form-group">
              <label>Encadrant professionnel</label>
              <input v-model="store.form.encadrant_professionnel" class="form-input" placeholder="Nom de l'encadrant"    maxlength="100" />
            </div>
            <div class="form-group">
              <label>Encadrant académique</label>
              <input v-model="store.form.encadrant_academique"    class="form-input" placeholder="Nom du tuteur"         maxlength="100" />
            </div>
            <div class="form-group">
              <label>Durée (semaines)</label>
              <input
                v-model.number="store.form.duree_semaines"
                type="number"
                class="form-input"
                placeholder="ex: 8"
                min="1"
                max="104"
              />
            </div>
            <div class="form-group">
              <label>Date de début *</label>
              <input v-model="store.form.date_debut" type="date" class="form-input" />
            </div>
            <div class="form-group">
              <label>Date de fin</label>
              <input v-model="store.form.date_fin"   type="date" class="form-input" />
            </div>
            <div class="form-group form-group--full">
              <label>Missions *</label>
              <textarea
                v-model="store.form.missions"
                class="form-input form-textarea"
                placeholder="Décrivez vos missions..."
                maxlength="2000"
              ></textarea>
            </div>
            <div class="form-group">
              <label>Visibilité</label>
              <select v-model="store.form.est_public" class="form-input">
                <option :value="true">Public</option>
                <option :value="false">Privé</option>
              </select>
            </div>
          </div>

          <!-- Messages d'erreur de validation -->
          <p v-if="validationError" class="form-error">{{ validationError }}</p>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="store.modal.open = false">Annuler</button>
          <button
            class="btn-new"
            :disabled="store.saving"
            @click="handleSave"
          >
            {{ store.saving ? 'Enregistrement...' : (store.modal.mode === 'create' ? 'Créer le stage' : 'Enregistrer') }}
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useStageStore } from '@/stores/stageStore'

const store = useStageStore()

const validationError = ref('')

// ── Helpers ────────────

const sanitizeStr = (val, maxLen) =>
  typeof val === 'string'
    ? val.trim().replace(/[\u0000-\u001F\u007F]/g, '').slice(0, maxLen)
    : ''

const isValidDate = (val) =>
  typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val) && !isNaN(Date.parse(val))

// ── Validation + sauvegarde ────────

function handleSave() {
  validationError.value = ''

  const { form } = store

  // Champs obligatoires
  if (!sanitizeStr(form.entreprise, 150)) {
    validationError.value = 'Le champ "Entreprise" est obligatoire.'
    return
  }
  if (!sanitizeStr(form.poste, 150)) {
    validationError.value = 'Le champ "Poste" est obligatoire.'
    return
  }
  if (!sanitizeStr(form.missions, 2000)) {
    validationError.value = 'Le champ "Missions" est obligatoire.'
    return
  }
  if (!isValidDate(form.date_debut)) {
    validationError.value = 'La date de début est obligatoire et doit être valide.'
    return
  }

  // Cohérence des dates
  if (form.date_fin && isValidDate(form.date_fin)) {
    if (new Date(form.date_fin) < new Date(form.date_debut)) {
      validationError.value = 'La date de fin ne peut pas être antérieure à la date de début.'
      return
    }
  }

  if (form.duree_semaines !== null && form.duree_semaines !== '') {
    const dur = Number(form.duree_semaines)
    if (!Number.isInteger(dur) || dur < 1 || dur > 104) {
      validationError.value = 'La durée doit être un entier compris entre 1 et 104 semaines.'
      return
    }
  }

  if (typeof form.est_public !== 'boolean') {
    validationError.value = 'La visibilité est invalide.'
    return
  }

  store.sauvegarder()
}
</script>

<style scoped>
@import '@/assets/StageList.css';

.form-error {
  color: #e53e3e;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}
</style>