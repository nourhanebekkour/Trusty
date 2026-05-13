<template>
  <section class="hero">
    <div class="hero-content">
      <div class="hero-badge">
        <span class="dot"></span>
        Plateforme certifiée &amp; sécurisée
      </div>

      <h1>
        Plateforme de<br>
        Portfolios Numériques<br>
        <span class="accent">Adaptatifs</span> et<br>
        Certifiés
      </h1>

      <p class="hero-sub">
        Valorisez votre parcours académique et professionnel avec une visibilité garantie
        et des validations institutionnelles qui font la différence.
      </p>

      <ul class="hero-checklist">
        <li>
          <span class="check-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
          Obtenez des validations institutionnelles
        </li>
        <li>
          <span class="check-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
          Augmentez votre score de crédibilité
        </li>
      </ul>

      <div class="hero-actions">
        <button class="btn-primary-lg">Mon Portfolio</button>
      </div>
    </div>

    <div class="hero-visual">
      <div class="cert-card">
        <div class="cert-header">
          <div class="cert-avatar">T</div>
          <div class="cert-title-block">
            <div class="cert-title">Certificat de Validation</div>
            <div class="cert-sub">Trusty Verified Professional</div>
          </div>
          <svg class="cert-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
          </svg>
        </div>

        <div class="cert-lines">
          <div class="line-skeleton w-full"></div>
          <div class="line-skeleton w-2-3"></div>
        </div>

        <div class="cert-body">
          <div class="shield-large">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
          </div>
        </div>

        <div class="cert-footer">
          <div class="expert-avatars">
            <div class="expert-avatar ea1">A</div>
            <div class="expert-avatar ea2">B</div>
            <div class="expert-avatar ea3">C</div>
          </div>
          <span class="validated-tag">Validé par 12 experts</span>
        </div>
      </div>

    </div>
  </section>
</template>

<script>
export default {
  name: 'HeroVue'
}
</script>

<style scoped>
.hero {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  padding: 120px 5rem 80px;
  gap: 4rem;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -100px;
  right: -200px;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(214, 237, 232, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.hero::after {
  content: '';
  position: absolute;
  bottom: -50px;
  left: -100px;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(26, 56, 56, 0.4) 0%, transparent 70%);
  pointer-events: none;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--surface);
  color: var(--mint);
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border);
}

.hero-badge .dot {
  width: 6px;
  height: 6px;
  background: var(--mint);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

h1 {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: 1.1;
  color: var(--dark);
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

h1 .accent {
  color: var(--mint);
  font-style: italic;
}

.hero-sub {
  color: var(--muted);
  font-size: 1.05rem;
  line-height: 1.7;
  margin-bottom: 2rem;
  max-width: 480px;
}

.hero-checklist {
  list-style: none;
  margin-bottom: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hero-checklist li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  color: var(--dark);
}

.check-icon {
  width: 22px;
  height: 22px;
  background: var(--surface);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid var(--border);
}

.check-icon svg {
  width: 12px;
  height: 12px;
  color: var(--mint);
}

.hero-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

/* ─── Hero Visual ─── */
.hero-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.cert-card {
  background: var(--surface);
  border-radius: 20px;
  padding: 28px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
  animation: float 4s ease-in-out infinite;
}

.cert-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.cert-avatar {
  width: 44px;
  height: 44px;
  background: var(--bg);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mint);
  font-family: 'DM Serif Display', serif;
  font-size: 1.2rem;
  border: 1px solid var(--border);
}

.cert-title-block {
  flex: 1;
  margin: 0 12px;
}

.cert-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--dark);
}

.cert-sub {
  font-size: 0.75rem;
  color: var(--muted);
}

.cert-badge-icon {
  width: 32px;
  height: 32px;
  color: var(--mint);
}

.cert-body {
  background: var(--bg);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  min-height: 100px;
  border: 1px solid var(--border);
}

.shield-large svg {
  width: 48px;
  height: 48px;
  color: var(--mint);
}

.cert-lines {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.line-skeleton {
  height: 8px;
  background: var(--border);
  border-radius: 4px;
}

.line-skeleton.w-full { width: 100%; }
.line-skeleton.w-2-3 { width: 66%; }

.cert-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.expert-avatars {
  display: flex;
}

.expert-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--surface);
  margin-left: -8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 600;
  color: white;
}

.ea1 { background: #1A3838; margin-left: 0; border: 2px solid rgba(214, 237, 232, 0.3); }
.ea2 { background: #2a4f4f; }
.ea3 { background: #D6EDE8; color: #0D2B2B; }

.validated-tag {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--mint);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}



@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    padding: 100px 2rem 60px;
  }

  .hero-visual {
    display: none;
  }
}
</style>