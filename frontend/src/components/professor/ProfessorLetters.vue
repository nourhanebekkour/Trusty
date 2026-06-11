<template>
  <div class="card" style="margin-top: 20px;">
    <div class="card-header">
      <div class="card-title"><i class="ti ti-file-certificate"></i> Lettres de recommandation</div>
      <div class="card-action"><i class="ti ti-plus"></i> Nouvelle</div>
    </div>

    <div v-for="lettre in lettres" :key="lettre.id" class="notif-item">
      <span class="notif-dot" :style="{ background: lettre.color }"></span>
      <div class="notif-content">
        <div class="notif-text">
          <strong>{{ lettre.etudiant }}</strong> {{ lettre.message }}
        </div>
        <div class="notif-time">{{ lettre.time }} · {{ lettre.formation }}</div>
      </div>
      <button
        class="btn-sm"
        :class="lettre.urgent ? 'btn-warn' : 'btn-primary'"
        style="margin-left: auto; flex-shrink: 0;"
        @click="emit('action', lettre)"
      >
        {{ lettre.action }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  lettres: { type: Array, default: () => [] },
})

const emit = defineEmits(['action'])
</script>