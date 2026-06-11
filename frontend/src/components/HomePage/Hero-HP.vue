<template>
  <section class="hero-section">
    <div class="hero-badge">
      <span class="dot"></span>
      Plateforme certifiée
    </div>

    <div class="hero-content">
      <div class="hero-text">
        <h1>
          Portfolios Numériques
          <span class="accent">Adaptatifs</span>
          et Certifiés
        </h1>
        <p class="hero-sub">
          Valorisez votre parcours académique et professionnel avec des
          validations institutionnelles qui font la différence.
        </p>
        <ul class="hero-checklist">
          <li>Obtenez des validations institutionnelles</li>
          <li>Augmentez votre score de crédibilité</li>
        </ul>
        <button class="btn-primary-lg">Mon Portfolio</button>
      </div>

      <div class="hero-visual">
        <div class="cert-card">
          <div class="cert-title">Certificat de Validation</div>
          <div class="cert-body">
            <div class="shield-large">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                <path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6L12 2z"/>
              </svg>
            </div>
          </div>
          <div class="cert-footer">
            <div class="expert-avatars">
              <div class="expert-avatar">A</div>
              <div class="expert-avatar">B</div>
              <div class="expert-avatar">C</div>
            </div>
            <span class="validated-tag">Validé par 12 experts</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'HeroVue',
}
</script>
