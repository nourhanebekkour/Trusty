<template>
  <footer class="professional-footer">
    <span>Professional Space</span>
    <span>Supervision only — no official validation</span>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.professional-footer {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 260px;
  z-index: 15;
  height: 44px;
  padding: 0 32px;
  background: #ffffff;
  border-top: 1px solid #e7e1d6;
  color: #7b7164;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media (max-width: 900px) {
  .professional-footer {
    left: 0;
    padding: 0 18px;
  }
}
</style>