<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal__header">
          <div>
            <h3 class="modal__title">{{ title }}</h3>
            <p v-if="subtitle" class="modal__subtitle">{{ subtitle }}</p>
          </div>
          <button class="modal__close" @click="$emit('close')">✕</button>
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
  background: #fafaf8;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 28px 16px;
  border-bottom: 1px solid #2a4a48;
}
.modal__title {
  font-size: 18px;
  font-weight: 700;
  color: #D6EDE8;
}
.modal__subtitle {
  font-size: 13px;
  color: #8aada9;
  margin-top: 4px;
}
.modal__close {
  background: none;
  border: none;
  font-size: 16px;
  color: #4a6e6a;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
}
.modal__close:hover { color: #c8deda; }
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
  background: #1A3838;
  border: 1px solid #2a4a48;
  color: #c8deda;
}
.btn--secondary:hover { background: #162e2e; }
.btn--primary {
  background: #5C8C6A;
  color: #fff;
}
.btn--primary:hover { background: #4a7058; }
</style>