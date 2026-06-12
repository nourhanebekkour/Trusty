<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ isEdit ? 'Modifier l\'activité' : 'Nouvelle activité' }}</h2>
          <button class="close-btn" @click="$emit('close')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>Type d'activité *</label>
              <select v-model="form.type_activite">
                <option value="">— Sélectionner —</option>
                <option v-for="t in types" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Nom de l'activité *</label>
              <input type="text" v-model="form.nom_activite" placeholder="Ex: Hackathon IA Maroc" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Organisation *</label>
              <input type="text" v-model="form.organisation" placeholder="Ex: ENSA Tanger" />
            </div>
            <div class="form-group">
              <label>Rôle *</label>
              <input type="text" v-model="form.role" placeholder="Ex: Participant" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Date de début *</label>
              <input type="date" v-model="form.date_debut" />
            </div>
            <div class="form-group">
              <label>Date de fin</label>
              <input type="date" v-model="form.date_fin" />
            </div>
          </div>

          <div class="form-group full">
            <label>Description</label>
            <textarea v-model="form.description" rows="3" placeholder="Décrivez votre participation..."></textarea>
          </div>

          <div class="form-group full">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.est_public" />
              <span>Activité publique</span>
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="$emit('close')">Annuler</button>
          <button class="btn-submit" @click="submit" :disabled="!isValid">
            {{ isEdit ? 'Enregistrer' : 'Ajouter' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  activite: { type: Object, default: null },
});

const emit = defineEmits(['close', 'submit']);

const types = [
  { value: 'CLUB', label: 'Club' },
  { value: 'EVENEMENT', label: 'Événement' },
  { value: 'HACKATHON', label: 'Hackathon' },
  { value: 'COMPETITION', label: 'Compétition' },
  { value: 'ENGAGEMENT', label: 'Engagement' },
];

const isEdit = computed(() => !!props.activite);

const defaultForm = () => ({
  type_activite: '',
  nom_activite: '',
  organisation: '',
  role: '',
  date_debut: '',
  date_fin: '',
  description: '',
  est_public: true,
});

const form = ref(defaultForm());

watch(() => props.activite, (val) => {
  if (val) form.value = { ...defaultForm(), ...val };
  else form.value = defaultForm();
}, { immediate: true });

const isValid = computed(() =>
  form.value.type_activite && form.value.nom_activite && form.value.organisation && form.value.role && form.value.date_debut
);

function submit() {
  if (!isValid.value) return;
  emit('submit', { ...form.value });
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

.modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: 18px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.25s ease;
}

@keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.3rem 1.5rem 1rem;
  border-bottom: 1px solid var(--color-border-light);
}

.modal-header h2 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.close-btn {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover { background: var(--color-surface-hover); color: var(--color-text-primary); }

.modal-body {
  padding: 1.3rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group.full { grid-column: 1 / -1; }

label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
}

input, select, textarea {
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 0.85rem;
  transition: border-color 0.2s;
  outline: none;
}

input:focus, select:focus, textarea:focus {
  border-color: var(--color-accent-border);
}

select option { background: var(--color-surface); }
textarea { resize: vertical; }

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.83rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: none;
  letter-spacing: 0;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 16px; height: 16px;
  padding: 0;
  accent-color: var(--color-accent);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem 1.3rem;
  border-top: 1px solid var(--color-border-light);
}

.btn-cancel {
  padding: 0.55rem 1.2rem;
  border-radius: 9px;
  border: 1px solid var(--color-border-light);
  background: transparent;
  color: var(--color-text-tertiary);
  font-family: inherit;
  font-size: 0.83rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.btn-submit {
  padding: 0.55rem 1.4rem;
  border-radius: 9px;
  border: none;
  background: var(--color-accent);
  color: var(--color-surface);
  font-family: inherit;
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: var(--color-accent-hover);
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 520px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>
