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
  background: #1A3838;
  border: 1px solid rgba(214, 237, 232, 0.13);
  border-radius: 16px;
  width: 480px;
  max-width: 94vw;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  animation: fadeUp 0.25s ease;
  color: #D6EDE8;
  overflow: hidden;
}

.rapport-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(214, 237, 232, 0.08);
}

.rapport-icon {
  font-size: 18px;
}

.rapport-title {
  flex: 1;
  font-size: 17px;
  font-weight: 700;
  color: #D6EDE8;
  margin: 0;
}

.rapport-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: rgba(214, 237, 232, 0.35);
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.2s;
  line-height: 1;
}

.rapport-close:hover {
  background: rgba(214, 237, 232, 0.1);
  color: #D6EDE8;
}

.rapport-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rapport-hint {
  font-size: 13px;
  color: rgba(214, 237, 232, 0.55);
  margin: 0;
  line-height: 1.5;
}

.upload-zone {
  border: 2px dashed rgba(214, 237, 232, 0.15);
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
  border-color: rgba(92, 140, 106, 0.5);
  background: rgba(92, 140, 106, 0.06);
}

.file-input-hidden {
  display: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: rgba(214, 237, 232, 0.35);
  font-size: 13px;
}

.upload-clear {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(196, 90, 90, 0.15);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 14px;
  color: #c45a5a;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.upload-clear:hover {
  background: rgba(196, 90, 90, 0.3);
}

.separator-text {
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(214, 237, 232, 0.2);
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
  color: rgba(214, 237, 232, 0.5);
}

.form-input {
  background: rgba(13, 43, 43, 0.6);
  border: 1px solid rgba(214, 237, 232, 0.1);
  border-radius: 8px;
  padding: 10px 12px;
  color: #D6EDE8;
  font-family: inherit;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: rgba(92, 140, 106, 0.5);
}

.form-input::placeholder {
  color: rgba(214, 237, 232, 0.2);
}

.rapport-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid rgba(214, 237, 232, 0.08);
}

.btn-cancel {
  padding: 0.55rem 1.2rem;
  border-radius: 9px;
  border: 1px solid rgba(214, 237, 232, 0.12);
  background: transparent;
  color: rgba(214, 237, 232, 0.5);
  font-family: inherit;
  font-size: 0.83rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: rgba(214, 237, 232, 0.07);
  color: #D6EDE8;
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.55rem 1.2rem;
  background: #1D9E75;
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
  background: #24b88a;
  transform: translateY(-1px);
}

.btn-save:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
