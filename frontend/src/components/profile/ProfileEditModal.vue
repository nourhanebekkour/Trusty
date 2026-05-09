<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>Modifier le profil</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <label>Prénom</label>
        <input v-model="form.prenom"    type="text" placeholder="Prénom" />
        <label>Nom</label>
        <input v-model="form.nom"       type="text" placeholder="Nom" />
        <label>Téléphone</label>
        <input v-model="form.telephone" type="text" placeholder="+212 6 ..." />
        <label>Ville</label>
        <input v-model="form.ville"     type="text" placeholder="Fès, Maroc" />
      </div>
      <div class="modal-footer">
        <button class="btn-outline" @click="$emit('close')">Annuler</button>
        <button class="btn-primary" @click="$emit('save', form)" :disabled="saving">
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({ user: Object, saving: Boolean })
defineEmits(['close', 'save'])

const form = reactive({
  prenom:    props.user.prenom    ?? '',
  nom:       props.user.nom       ?? '',
  telephone: props.user.telephone ?? '',
  ville:     props.user.ville     ?? '',
})

watch(() => props.user, (u) => {
  form.prenom    = u.prenom    ?? ''
  form.nom       = u.nom       ?? ''
  form.telephone = u.telephone ?? ''
  form.ville     = u.ville     ?? ''
})
</script>
<style scoped>
@import '@/assets/Profile.css';
</style>