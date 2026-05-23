<template>
  <div class="card" style="margin-top: 20px;">
    <div class="card-header">
      <div class="card-title"><i class="ti ti-bell"></i> Activité récente</div>
    </div>

    <div
      v-for="notif in notifications"
      :key="notif.id"
      class="notif-item"
      :class="{ 'no-border': notif.last }"
    >
      <span class="notif-dot" :style="{ background: notif.color }"></span>
      <div>
        <div class="notif-text">
          <strong>{{ notif.nom }}</strong> {{ notif.message }}
        </div>
        <div class="notif-time">{{ notif.time }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  notifications: { type: Array, default: () => [] },
})
</script>