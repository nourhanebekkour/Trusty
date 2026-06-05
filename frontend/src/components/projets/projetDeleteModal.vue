<template>
  <transition name="modal-fade">
    <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3 class="modal-title">Supprimer le projet</h3>
          <button class="modal-close" @click="$emit('update:modelValue', false)">×</button>
        </div>
        <div class="modal-body">
          <p class="confirm-text">
            Voulez-vous vraiment supprimer <strong>« {{ projet?.titre }} »</strong> ?
            Cette action est irréversible.
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="$emit('update:modelValue', false)">Annuler</button>
          <button class="btn-delete" :disabled="submitting" @click="$emit('confirm')">
            <span v-if="submitting" class="btn-spinner"></span>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ProjetDeleteModal',
  props: {
    modelValue: { type: Boolean, default: false },
    projet:     { type: Object,  default: null },
    submitting: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'confirm'],
}
</script>
<style scoped>
   @import "@/assets/projet"
</style>