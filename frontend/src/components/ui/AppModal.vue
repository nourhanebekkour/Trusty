<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal__header">
          <div>
            <h3 class="modal__title">{{ title }}</h3>
            <p v-if="subtitle" class="modal__subtitle">{{ subtitle }}</p>
          </div>
          <button class="modal__close" aria-label="Fermer" @click="$emit('close')"><AppIcon name="x" /></button>
        </div>
        <div class="modal__body">
          <slot />
        </div>
        <div class="modal__footer">
          <button class="btn btn--secondary" @click="$emit('close')">Annuler</button>
          <button class="btn btn--primary" @click="$emit('confirm')">
            <slot name="confirm-label">Enregistrer le profil</slot>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  show:     { type: Boolean, required: true },
  title:    { type: String, required: true },
  subtitle: { type: String, default: null }
})
defineEmits(['close', 'confirm'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: var(--color-surface-alt);
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-panel);
}
.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 28px 16px;
  border-bottom: 1px solid var(--color-border);
}
.modal__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
}
.modal__subtitle {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}
.modal__close {
  background: none;
  border: none;
  font-size: 16px;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: 4px;
  line-height: 1;
}
.modal__close:hover { color: var(--color-text-primary); }
.modal__body  { padding: 24px 28px; }
.modal__footer {
  padding: 16px 28px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
}
.btn--secondary {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}
.btn--secondary:hover { background: var(--color-surface-hover); }
.btn--primary {
  background: var(--color-accent);
  color: #fff;
}
.btn--primary:hover { background: var(--color-accent-hover); }

@media (max-width: 640px) {
  .modal { max-width: 100%; margin: 8px; max-height: 96vh; border-radius: 12px; }
  .modal__header { padding: 18px 20px 12px; }
  .modal__body { padding: 18px 20px; }
  .modal__footer { padding: 14px 20px 18px; flex-direction: column-reverse; }
  .modal__footer .btn { width: 100%; justify-content: center; }
}
</style>
