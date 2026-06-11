<template>
  <div class="card rec-form-card" v-if="candidat" style="margin-top: 20px;">
    <div class="card-header">
      <div class="card-title">
        <i class="ti ti-quote"></i> Recommandation pour
        <span class="rec-for-name">{{ candidat.nom }}</span>
      </div>
      <div class="card-action" @click="emit('fermer')">
        <i class="ti ti-x"></i> Fermer
      </div>
    </div>

    <div class="rec-type-row">
      <div
        class="rec-type-card"
        :class="{ active: recType === 'rapide' }"
        @click="recType = 'rapide'"
      >
        <i class="ti ti-zap"></i>
        <div>
          <div class="rec-type-title">Repas Rapide (Flux interne)</div>
          <div class="rec-type-sub">Court commentaire partagé sur votre flux</div>
        </div>
      </div>
      <div
        class="rec-type-card"
        :class="{ active: recType === 'officielle' }"
        @click="recType = 'officielle'"
      >
        <i class="ti ti-certificate"></i>
        <div>
          <div class="rec-type-title">Recommandation Officielle (Citation)</div>
          <div class="rec-type-sub">Recommandation formelle épinglée sur le portfolio</div>
        </div>
      </div>
    </div>

    <textarea
      v-model="recTexte"
      class="rec-textarea"
      :placeholder="recType === 'rapide'
        ? 'Ajoutez un court commentaire professionnel sur ce candidat...'
        : 'Rédigez une recommandation formelle qui sera épinglée sur le portfolio de l\'étudiant...'"
      rows="4"
      maxlength="500"
    ></textarea>

    <div class="rec-form-footer">
      <span class="rec-form-hint">
        <i class="ti ti-info-circle"></i>
        {{ recType === 'officielle'
          ? 'Sera visible sur le portfolio · Signé & certifié par votre organisation'
          : 'Partagé sur votre flux professionnel interne' }}
      </span>
      <span class="rec-char-count" :class="{ warn: recTexte.length > 400 }">
        {{ recTexte.length }}/500
      </span>
    </div>

    <div class="action-bar-form">
      <button
        class="btn-primary btn-action"
        :disabled="!canSubmit"
        @click="envoyer"
      >
        <i class="ti ti-send"></i>
        {{ recType === 'rapide' ? 'Partager sur mon flux' : 'Signer & Certifier' }}
      </button>
      <button class="btn-ghost btn-action" @click="emit('fermer')">
        Annuler
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  candidat: { type: Object, default: null },
})

const emit = defineEmits(['envoyer', 'fermer'])

const recTexte = ref('')
const recType  = ref('officielle')

const VALID_TYPES = ['rapide', 'officielle']


const sanitizeText = (val, maxLen = 500) =>
  typeof val === 'string'
    ? val.trim().replace(/[\u0000-\u001F\u007F]/g, '').slice(0, maxLen)
    : ''

const canSubmit = computed(() =>
  recTexte.value.trim().length > 0 &&
  recTexte.value.length <= 500 &&
  VALID_TYPES.includes(recType.value)
)

function envoyer() {
  if (!canSubmit.value) return

  if (!props.candidat?.id_etudiant || typeof props.candidat.id_etudiant !== 'number') {
    if (import.meta.env.DEV) {
      console.warn('[RecommandationForm] candidat.id_etudiant invalide', props.candidat)
    }
    return
  }

  emit('envoyer', {
    texte: sanitizeText(recTexte.value),
    type:  recType.value, 
  })

  recTexte.value = ''
  recType.value  = 'officielle'
}
</script>