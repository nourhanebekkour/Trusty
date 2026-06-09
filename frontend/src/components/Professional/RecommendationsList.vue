<template>
  <div class="card" style="margin-top: 20px;">
    <div class="card-header">
      <div class="card-title"><i class="ti ti-message-star"></i> Recommandations émises</div>
    </div>

    <div v-if="recs.length === 0" class="empty-state">
      Aucune recommandation émise
    </div>

    <div
      v-for="(rec, i) in recs"
      :key="i"
      class="notif-item"
      :class="{ 'no-border': i === recs.length - 1 }"
    >
      <div class="avatar-sm" :style="{ background: rec.gradient }">{{ rec.initiales }}</div>
      <div class="notif-content">
        <div class="notif-text">
          <strong>{{ rec.nom }}</strong>
          <span
            class="rec-type-badge"
            :class="rec.type === 'officielle' ? 'badge-cert' : 'badge-rapide'"
          >
            {{ rec.type === 'officielle' ? 'Officielle' : 'Rapide' }}
          </span>
        </div>
        <div class="notif-time">{{ rec.extrait }}</div>
        <div class="notif-time">{{ rec.date }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  recs: { type: Array, default: () => [] },
})
</script>