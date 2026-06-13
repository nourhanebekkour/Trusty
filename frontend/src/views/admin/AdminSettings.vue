<template>
  <div class="page">
    <div class="page__header">
      <div>
        <h1 class="page__title">Paramètres</h1>
        <p class="page__subtitle">Gérez vos préférences et informations de compte.</p>
      </div>
    </div>
    <div class="page__body">
      <SettingsPage />
    </div>
  </div>
</template>

<script setup>
import SettingsPage from '@/components/settings/SettingsPage.vue'
</script>

<style scoped>
.page {
  padding: 32px;
}
.page__header {
  margin-bottom: 24px;
}
.page__title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}
.page__subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

@media (max-width: 768px) {
  .page { padding: 20px 16px; }
  .page__title { font-size: 20px; }
}
</style>
