<template>
  <footer class="footer">
    <div class="footer__inner">

      <div class="footer__brand">
        <div class="footer__logo">
          <img :src="iconTrusty" alt="Trusty" class="footer__logo-icon" />
          <span class="footer__logo-text">TRUSTY</span>
        </div>
        <p class="footer__tagline">
          Plateforme de Portfolios Numériques Adaptatifs et Certifiés.
        </p>
      </div>

      <div class="footer__col">
        <p class="footer__col-title">Plateforme</p>
        <nav class="footer__links">
          <span>Comment ça marche</span>
          <span>Sécurité &amp; Certification</span>
          <span>Tarifs</span>
        </nav>
      </div>

      <div class="footer__col">
        <p class="footer__col-title">Support</p>
        <nav class="footer__links">
          <span>Centre d'aide</span>
          <a href="mailto:contact@trusty.fr">Contact</a>
          <span>Mentions Légales</span>
        </nav>
      </div>

      <div class="footer__col">
        <p class="footer__col-title">Suivez-nous</p>
        <div class="footer__social">
          <button class="footer__social-btn" aria-label="Réseaux sociaux non configurés" disabled>
            <img :src="iconReseaux" alt="Réseaux sociaux" class="footer__social-icon" />
          </button>
          <button class="footer__social-btn" aria-label="Applications non configurées" disabled>
            <img :src="iconApps" alt="Applications" class="footer__social-icon" />
          </button>
        </div>
      </div>

    </div>

    <div class="footer__bottom">
      <p>© 2026 TRUSTY. Tous droits réservés.</p>
    </div>
  </footer>
</template>

<script setup>
import iconTrusty from '@/assets/icons/trusty.svg'
import iconReseaux from '@/assets/icons/reseaux.svg'
import iconApps from '@/assets/icons/apps.svg'
</script>

<style scoped>
.footer {
  background: var(--color-surface);
  width: 100%;
  font-family: 'Inter', sans-serif;
}

.footer__inner {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 24px;
  padding: 20px 36px 16px;
  border-top: 1px solid var(--color-border);
}

/* Brand */

.footer__logo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.footer__logo-icon {
  width: 20px;
  height: 20px;
  filter: none;
}

.footer__logo-text {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 16px;
  font-weight: 700;
  color: var(--color-text);
}

.footer__tagline {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 17px;
  color: var(--color-text-muted);
}

/* Columns */
.footer__col-title {
  margin: 0 0 8px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  line-height: 20px;
  font-weight: 700;
  color: var(--color-text);
}

.footer__links {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.footer__links a,
.footer__links span {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 18px;
  transition: color 0.2s;
  color: var(--color-text-muted);
  text-decoration: none; 
}

.footer__links a:hover {
  color: var(--color-text);
}

/* Social */
.footer__social {
  display: flex;
  gap: 10px;
}

.footer__social-btn {
  width: 32px;
  height: 32px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.footer__social-btn:hover {
  background: var(--color-background-mute);
}

.footer__social-btn:active {
  background: var(--color-background-soft);
}

.footer__social-btn:disabled {
  opacity: 0.4;
}

.footer__social-icon {
  width: 18px;
  height: 18px;
}

/* Bottom bar */
.footer__bottom {
  border-top: 1px solid var(--color-border);
  padding: 10px 36px;
  text-align: center;
}

.footer__bottom p {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  color: var(--color-text-muted);
}

/* Responsive */
@media (max-width: 768px) {
  .footer__inner {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  .footer__brand {
    grid-column: 1 / -1;
  }
}

@media (max-width: 480px) {
  .footer__inner {
    grid-template-columns: 1fr;
  }
}
</style>
