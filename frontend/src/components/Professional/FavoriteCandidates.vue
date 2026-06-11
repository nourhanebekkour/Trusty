<template>
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="ti ti-bookmark"></i> Candidats suivis</div>
      <div class="card-action">Voir tous <i class="ti ti-arrow-right"></i></div>
    </div>

    <div
      v-for="c in candidats"
      :key="c.id"
      class="student-row"
      @click="emit('select', c)"
    >
      <div class="avatar-sm" :style="{ background: c.gradient }">{{ c.initiales }}</div>
      <div>
        <div class="stud-name">{{ c.nom }}</div>
        <div class="stud-sub">{{ c.formation }}</div>
      </div>
      <div class="stud-score" :class="c.score >= 80 ? 'ok' : 'warn'">{{ c.score }}</div>
    </div>

    <div v-if="candidats.length === 0" class="empty-state">
      Aucun favori pour le moment
    </div>
  </div>
</template>

<script setup>
defineProps({
  candidats: { type: Array, default: () => [] },
})

const emit = defineEmits(['select'])
</script>