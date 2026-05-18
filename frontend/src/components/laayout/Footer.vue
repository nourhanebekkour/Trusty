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
          <a href="#">Comment ça marche</a>
          <a href="#">Sécurité &amp; Certification</a>
          <a href="#">Tarifs</a>
        </nav>
      </div>

      <div class="footer__col">
        <p class="footer__col-title">Support</p>
        <nav class="footer__links">
          <a href="#">Centre d'aide</a>
          <a href="#">Contact</a>
          <a href="#">Mentions Légales</a>
        </nav>
      </div>

      <div class="footer__col">
        <p class="footer__col-title">Suivez-nous</p>
        <div class="footer__social">
          <button class="footer__social-btn" aria-label="Réseaux sociaux">
            <img :src="iconReseaux" alt="Réseaux sociaux" class="footer__social-icon" />
          </button>
          <button class="footer__social-btn" aria-label="Applications">
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
  background: #1A3021;
  width: 100%;
  font-family: 'Inter', sans-serif;
}

.footer__inner {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 24px;
  padding: 20px 36px 16px;
  border-top: 1px solid #1F2937;
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
  filter: invert(52%) sepia(25%) saturate(600%) hue-rotate(95deg) brightness(85%) contrast(90%);
}

.footer__logo-text {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 16px;
  font-weight: 700;
  color: #F4F2EC;
}

.footer__tagline {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 17px;
  color: #F4F2EC;
}

/* Columns */
.footer__col-title {
  margin: 0 0 8px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  line-height: 20px;
  font-weight: 700;
  color: #ffffff;
}

.footer__links {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.footer__links a {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 18px;
  transition: color 0.2s;
  color: #9CA3AF;        /* ← ajoute cette ligne */
  text-decoration: none; 
}

.footer__links a:hover {
  color: #ffffff;
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
  background: rgba(255, 255, 255, 0.08);
}

.footer__social-btn:active {
  background: rgba(255, 255, 255, 0.12);
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
  border-top: 1px solid #1F2937;
  padding: 10px 36px;
  text-align: center;
}

.footer__bottom p {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  color: #9CA3AF;
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