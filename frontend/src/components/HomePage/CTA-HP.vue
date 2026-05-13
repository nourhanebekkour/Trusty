<template>
  <div class="cta-section">
    <div class="cta-banner">
      <div>
        <div class="cta-text">
          <h2>Prêt à transformer votre<br>parcours numérique ?</h2>
          <p>Rejoignez des milliers d'étudiants et d'institutions qui font déjà confiance à TRUSTY pour certifier le talent.</p>
        </div>
        <div class="cta-actions">
          <button class="btn-cta-white">Mon Portfolio</button>
          <button class="btn-cta-ghost">En savoir plus</button>
        </div>
      </div>

      <div class="cta-visual">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <polyline points="9 12 11 14 15 10"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CTAVue'
}
</script>

<style scoped>
.cta-section {
  padding: 40px 5rem 100px;
}

.cta-banner {
  background: var(--surface);
  border-radius: 24px;
  padding: 64px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 4rem;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border);
}

.cta-banner::before {
  content: '';
  position: absolute;
  top: -80px;
  right: 100px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(214, 237, 232, 0.07) 0%, transparent 70%);
  pointer-events: none;
}

.cta-banner::after {
  content: '';
  position: absolute;
  bottom: -60px;
  left: 200px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(214, 237, 232, 0.05) 0%, transparent 70%);
  pointer-events: none;
}

.cta-text h2 {
  font-family: 'DM Serif Display', serif;
  font-size: 2.2rem;
  color: var(--dark);
  line-height: 1.2;
  margin-bottom: 12px;
}

.cta-text p {
  color: var(--muted);
  font-size: 1rem;
}

.cta-visual {
  width: 120px;
  height: 120px;
  background: var(--bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  position: relative;
  flex-shrink: 0;
}

.cta-visual::before {
  content: '';
  position: absolute;
  inset: -12px;
  border-radius: 50%;
  border: 1px solid rgba(214, 237, 232, 0.15);
}

.cta-visual svg {
  width: 48px;
  height: 48px;
  color: var(--mint);
}

.cta-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  align-items: center;
}

.btn-cta-white {
  background: var(--mint);
  color: #0D2B2B;
  border: none;
  padding: 13px 26px;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cta-white:hover {
  background: #c4ddd8;
  transform: translateY(-1px);
}

.btn-cta-ghost {
  background: none;
  border: 1px solid var(--border);
  color: var(--muted);
  padding: 13px 24px;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cta-ghost:hover {
  background: rgba(214, 237, 232, 0.06);
  color: var(--dark);
  border-color: rgba(214, 237, 232, 0.25);
}

@media (max-width: 900px) {
  .cta-section {
    padding: 20px 2rem 60px;
  }

  .cta-banner {
    grid-template-columns: 1fr;
    padding: 40px;
  }

  .cta-visual {
    display: none;
  }
}
</style>