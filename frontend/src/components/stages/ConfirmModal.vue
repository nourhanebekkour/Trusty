<template>
  <transition name="modal-fade">
    <div v-if="modelValue" class="confirm-overlay" @click.self="cancel">
      <div class="confirm-modal">
        <div class="confirm-icon"><AppIcon name="warning" :size="38" /></div>
        <h3 class="confirm-title">{{ title }}</h3>
        <p class="confirm-message">{{ message }}</p>
        <div class="confirm-actions">
          <button class="btn-cancel" @click="cancel">Annuler</button>
          <button class="btn-danger" @click="confirm">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ConfirmModal',
  props: {
    modelValue:  { type: Boolean, default: false },
    title:       { type: String, default: 'Confirmer' },
    message:     { type: String, default: 'Êtes-vous sûr ?' },
    confirmText: { type: String, default: 'Confirmer' },
  },
  emits: ['update:modelValue', 'confirm', 'cancel'],
  methods: {
    confirm() {
      this.$emit('confirm')
      this.$emit('update:modelValue', false)
    },
    cancel() {
      this.$emit('cancel')
      this.$emit('update:modelValue', false)
    },
  },
}
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 27, 45, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}
.confirm-modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 32px 28px 24px;
  width: 380px;
  max-width: 90vw;
  text-align: center;
  box-shadow: var(--shadow-panel);
  animation: fadeUp 0.2s ease;
}
.confirm-icon {
  color: var(--color-danger);
  margin-bottom: 12px;
}
.confirm-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}
.confirm-message {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0 0 24px;
  line-height: 1.5;
}
.confirm-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}
.btn-cancel {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 10px 22px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.btn-cancel:hover {
  border-color: var(--color-accent-border);
  color: var(--color-text-primary);
}
.btn-danger {
  background: var(--color-danger);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 22px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.btn-danger:hover {
  background: #dc2626;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .confirm-modal { max-width: 100%; margin: 12px; }
  .confirm-body { padding: 18px; }
  .confirm-footer { padding: 14px 18px; }
}
</style>
