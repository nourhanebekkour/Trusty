<template>
  <footer class="professional-footer">
    <span>Espace Professionnel</span>
    <span>Supervision — pas de validation officielle</span>
  </footer>
</template>

<style scoped>
.professional-footer {
  height: 44px;
  padding: 0 24px;
  background: var(--color-surface, #FFFFFF);
  border-top: 1px solid var(--color-border, #D6D0C4);
  color: var(--color-text-secondary, #6B7280);
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media (max-width: 768px) {
  .professional-footer {
    padding: 0 14px;
    font-size: 11px;
  }
}
</style>
