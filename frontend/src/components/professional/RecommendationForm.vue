<template>
  <div v-if="candidat" class="card rec-form-card" style="margin-top: 20px;">
    <div class="card-header">
      <div class="card-title">
        Recommandation pour <span class="rec-for-name">{{ candidat.nom }}</span>
      </div>
      <button class="card-action" type="button" @click="emit('fermer')">
        Fermer
      </button>
    </div>

    <div class="rec-type-row">
      <button
        class="rec-type-card"
        type="button"
        :class="{ active: recType === 'rapide' }"
        @click="recType = 'rapide'"
      >
        <div>
          <div class="rec-type-title">Recommandation rapide</div>
          <div class="rec-type-sub">Court commentaire professionnel</div>
        </div>
      </button>
      <button
        class="rec-type-card"
        type="button"
        :class="{ active: recType === 'officielle' }"
        @click="recType = 'officielle'"
      >
        <div>
          <div class="rec-type-title">Recommandation officielle</div>
          <div class="rec-type-sub">Message formel soumis via l'API existante</div>
        </div>
      </button>
    </div>

    <textarea
      v-model="recTexte"
      class="rec-textarea"
      :placeholder="recType === 'rapide'
        ? 'Ajoutez un court commentaire professionnel sur ce candidat...'
        : 'Redigez une recommandation formelle pour ce profil etudiant...'"
      rows="4"
    ></textarea>

    <div class="rec-form-footer">
      <span class="rec-form-hint">
        {{ recType === 'officielle'
          ? "Cree une recommandation EN_ATTENTE pour l'etudiant."
          : "Utilise le meme endpoint backend avec un message court." }}
      </span>
      <span class="rec-char-count" :class="{ warn: recTexte.length > 400 }">
        {{ recTexte.length }}/500
      </span>
    </div>

    <div class="action-bar-form">
      <button
        class="btn-primary btn-action"
        type="button"
        :disabled="!recTexte.trim() || recTexte.length > 500"
        @click="envoyer"
      >
        {{ recType === 'rapide' ? 'Envoyer' : 'Envoyer la recommandation' }}
      </button>
      <button class="btn-ghost btn-action" type="button" @click="emit('fermer')">
        Annuler
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  candidat: { type: Object, default: null },
})

const emit = defineEmits(['envoyer', 'fermer'])

const recTexte = ref('')
const recType = ref('officielle')

function envoyer() {
  const texte = recTexte.value.trim()
  if (!texte || texte.length > 500) return

  emit('envoyer', {
    texte,
    type: recType.value,
  })

  recTexte.value = ''
  recType.value = 'officielle'
}
</script>
