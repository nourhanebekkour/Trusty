<template>
  <transition name="modal-fade">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div class="rapport-modal">

        <div class="rapport-header">
          <span class="rapport-icon">📄</span>
          <h3 class="rapport-title">Joindre un rapport</h3>
          <button class="rapport-close" @click="close">×</button>
        </div>

        <div class="rapport-body">

          <p class="rapport-hint">
            Téléversez un fichier ou collez une URL publique vers votre rapport.
          </p>

          <!-- Zone de dépôt fichier -->
          <div class="upload-zone" :class="{ 'upload-zone--active': dragging }"
               @dragover.prevent="dragging = true"
               @dragleave="dragging = false"
               @drop.prevent="onDrop">
            <input
              ref="fileInput"
              type="file"
              accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
              class="file-input-hidden"
              @change="onFileChange"
            />
            <div class="upload-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span v-if="selectedFile">{{ selectedFile.name }}</span>
              <span v-else>Cliquez ou glissez un fichier ici</span>
            </div>
            <button v-if="selectedFile" class="upload-clear" @click="selectedFile = null">×</button>
          </div>

          <div class="separator-text">ou</div>

          <!-- URL -->
          <div class="form-group">
            <label class="form-label">URL du rapport</label>
            <input
              v-model="rapportUrl"
              type="url"
              class="form-input"
              placeholder="https://drive.google.com/…"
            />
          </div>

        </div>

        <div class="rapport-footer">
          <button class="btn-cancel" @click="close">Annuler</button>
          <button class="btn-save" :disabled="!canSave" @click="save">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            Enregistrer
          </button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ProjetRapportModal',

  props: {
    modelValue: { type: Boolean, default: false },
  },

  emits: ['update:modelValue', 'save'],

  data() {
    return {
      selectedFile: null,
      rapportUrl: '',
      dragging: false,
    }
  },

  computed: {
    canSave() {
      return !!(this.selectedFile || this.rapportUrl.trim())
    },
  },

  watch: {
    modelValue(val) {
      if (!val) {
        this.selectedFile = null
        this.rapportUrl = ''
        this.dragging = false
      }
    },
  },

  methods: {
    onFileChange(e) {
      const file = e.target.files?.[0]
      if (file) this.selectedFile = file
    },

    onDrop(e) {
      this.dragging = false
      const file = e.dataTransfer?.files?.[0]
      if (file) this.selectedFile = file
    },

    save() {
      const data = {}
      if (this.selectedFile) {
        data.nom = this.selectedFile.name
        data.url = URL.createObjectURL(this.selectedFile)
        data.type = 'file'
      } else if (this.rapportUrl.trim()) {
        data.url = this.rapportUrl.trim()
        data.type = 'url'
      }
      this.$emit('save', data)
      this.close()
    },

    close() {
      this.$emit('update:modelValue', false)
    },
  },
}
</script>

<style scoped>
@import '@/assets/StageList.css';

.rapport-modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  width: 480px;
  max-width: 94vw;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-panel);
  animation: fadeUp 0.25s ease;
  color: var(--color-text-primary);
  overflow: hidden;
}

.rapport-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}

.rapport-icon {
  font-size: 18px;
}

.rapport-title {
  flex: 1;
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.rapport-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--color-text-tertiary);
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.2s;
  line-height: 1;
}

.rapport-close:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.rapport-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rapport-hint {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

.upload-zone {
  border: 2px dashed var(--color-border);
  border-radius: 12px;
  padding: 28px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  position: relative;
  text-align: center;
}

.upload-zone:hover,
.upload-zone--active {
  border-color: var(--color-accent-border);
  background: var(--color-accent-light);
}

.file-input-hidden {
  display: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--color-text-tertiary);
  font-size: 13px;
}

.upload-clear {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #FEF2F2;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 14px;
  color: #DC2626;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.upload-clear:hover {
  background: #FECACA;
}

.separator-text {
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-tertiary);
  position: relative;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
}

.form-input {
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: var(--color-accent);
}

.form-input::placeholder {
  color: var(--color-text-tertiary);
}

.rapport-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
}

.btn-cancel {
  padding: 0.55rem 1.2rem;
  border-radius: 9px;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  font-family: inherit;
  font-size: 0.83rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.55rem 1.2rem;
  background: var(--color-accent);
  border: none;
  border-radius: 9px;
  color: #fff;
  font-family: inherit;
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: var(--color-accent-hover);
  transform: translateY(-1px);
}

.btn-save:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
