<template>
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="ti ti-bell"></i> Activité récente</div>
    </div>

    <div
      v-for="notif in notifications"
      :key="notif.id"
      class="notif-item"
      :class="{ 'no-border': notif.last }"
      style="cursor: pointer"
      @click="store.marquerLue(notif.id)"
    >
      <span class="notif-dot" :style="{ background: notif.color }"></span>
      <div>
        <div class="notif-text"><strong>{{ notif.nom }}</strong> {{ notif.message }}</div>
        <div class="notif-time">{{ notif.time }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useProfessorStore } from '@/stores/professorStore'

defineProps({
  notifications: { type: Array, default: () => [] },
})

const store = useProfessorStore()
</script>