<template>
  <transition name="modal-fade">
    <div v-if="modelValue" class="confirm-overlay" @click.self="cancel">
      <div class="confirm-modal">
        <div class="confirm-icon">⚠️</div>
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
  background: rgba(13, 43, 43, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}
.confirm-modal {
  background: #1e3f3f;
  border: 1px solid rgba(214, 237, 232, 0.13);
  border-radius: 16px;
  padding: 32px 28px 24px;
  width: 380px;
  max-width: 90vw;
  text-align: center;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  animation: fadeUp 0.2s ease;
}
.confirm-icon {
  font-size: 36px;
  margin-bottom: 12px;
}
.confirm-title {
  font-size: 17px;
  font-weight: 700;
  color: #D6EDE8;
  margin: 0 0 8px;
}
.confirm-message {
  font-size: 14px;
  color: rgba(214, 237, 232, 0.55);
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
  color: rgba(214, 237, 232, 0.65);
  border: 1px solid rgba(214, 237, 232, 0.13);
  border-radius: 10px;
  padding: 10px 22px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.btn-cancel:hover {
  border-color: rgba(214, 237, 232, 0.25);
  color: #D6EDE8;
}
.btn-danger {
  background: #b94040;
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
  background: #d15555;
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

</style>
