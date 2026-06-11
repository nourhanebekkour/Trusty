<template>
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="ti ti-building-factory"></i> Stages supervisés</div>
    </div>

    <div v-for="(stage, i) in stages" :key="stage.id">
      <div style="margin-bottom: 14px;">
        <div class="stage-row">
          <div class="stage-name">{{ stage.entreprise }}</div>
          <span class="status-pill" :class="'pill-' + stage.status">{{ stage.statusLabel }}</span>
        </div>
        <div class="notif-time" style="margin-bottom: 6px;">
          {{ stage.etudiant }} · {{ stage.role }} · {{ stage.dates }}
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: stage.progress + '%', background: stage.color }"
          ></div>
        </div>
        <div class="notif-time" style="margin-top: 4px;">
          {{ stage.progress }}% · {{ stage.note }}
        </div>
      </div>
      <hr v-if="i < stages.length - 1" class="divider" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  stages: { type: Array, default: () => [] },
})
</script>