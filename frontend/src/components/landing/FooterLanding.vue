<template>
  <footer id="contact" class="footer-landing">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="footer-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" stroke="currentColor" opacity="0.6" />
          </svg>
          <span>TRUSTY</span>
        </div>
        <p class="footer-desc">
          Plateforme de portfolios numériques certifiés.<br />
          Valorisez votre parcours académique et professionnel.
        </p>
      </div>

      <div class="footer-links">
        <div class="footer-col">
          <h4>Plateforme</h4>
          <a href="#hero">Accueil</a>
          <a href="#features">Fonctionnalités</a>
          <a href="#spaces">Espaces</a>
        </div>
        <div class="footer-col">
          <h4>Légal</h4>
          <span>Mentions légales</span>
          <span>CGU</span>
          <span>Confidentialité</span>
        </div>
        <div class="footer-col">
          <h4>Contact</h4>
          <a href="mailto:contact@trusty.fr">contact@trusty.fr</a>
          <a href="mailto:contact@trusty.fr?subject=Support%20TRUSTY">Support</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; 2026 Trusty. Tous droits réservés.</span>
    </div>
  </footer>
</template>

<style scoped>
.footer-landing {
  position: relative;
  z-index: 1;
  background: var(--landing-surface);
  border-top: 1px solid var(--landing-border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 48px 0 24px;
}

.footer-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  justify-content: space-between;
  gap: 48px;
  flex-wrap: wrap;
}

.footer-brand {
  max-width: 280px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: var(--landing-text);
  margin-bottom: 12px;
}

.footer-desc {
  color: var(--landing-text-secondary);
  font-size: 0.85rem;
  line-height: 1.6;
}

.footer-links {
  display: flex;
  gap: 48px;
  flex-wrap: wrap;
}

.footer-col h4 {
  color: var(--landing-text);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 16px;
}

.footer-col a,
.footer-col span {
  display: block;
  color: var(--landing-text-secondary);
  text-decoration: none;
  font-size: 0.85rem;
  margin-bottom: 10px;
  transition: color 0.2s;
}

.footer-col a:hover {
  color: var(--landing-text);
}

.footer-bottom {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px 32px 0;
  margin-top: 32px;
  border-top: 1px solid var(--landing-border);
  text-align: center;
  font-size: 0.8rem;
  color: var(--landing-text-secondary);
}

@media (max-width: 768px) {
  .footer-inner {
    flex-direction: column;
    gap: 32px;
  }

  .footer-links {
    gap: 32px;
  }
}
</style>
