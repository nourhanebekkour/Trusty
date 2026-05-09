<template>
  <footer>
    <div class="footer-top">
      <div class="footer-brand">
        <a href="#" class="nav-logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
          </div>
          TRUSTY
        </a>
        <p>Plateforme de Portfolios Numériques Adaptatifs et Certifiés.</p>
      </div>

      <div class="footer-col">
        <h4>Plateforme</h4>
        <ul>
          <li><a href="#">Comment ça marche</a></li>
          <li><a href="#">Sécurité &amp; Certification</a></li>
          <li><a href="#">Tarifs</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Support</h4>
        <ul>
          <li><a href="#">Centre d'aide</a></li>
          <li><a href="#">Contact</a></li>
          <li><a href="#">Mentions Légales</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Suivez-nous</h4>
        <div class="social-btns">
          <div class="social-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/>
            </svg>
          </div>
          <div class="social-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© 2026 TRUSTY. Tous droits réservés.</p>
      <p class="made-with">Made with care for the future of education.</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterVue'
}
</script>

<style scoped>
footer {
  background: var(--surface);
  color: var(--muted);
  padding: 60px 5rem 32px;
  border-top: 1px solid var(--border);
}

.footer-top {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 48px;
}

.footer-brand .nav-logo {
  color: var(--dark);
  margin-bottom: 12px;
  display: flex;
}

.footer-brand p {
  font-size: 0.87rem;
  line-height: 1.6;
  color: var(--muted);
  max-width: 260px;
}

.footer-col h4 {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--dark);
  margin-bottom: 16px;
}

.footer-col ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-col a {
  text-decoration: none;
  color: var(--muted);
  font-size: 0.87rem;
  transition: color 0.2s;
}

.footer-col a:hover {
  color: var(--mint);
}

.footer-bottom {
  border-top: 1px solid var(--border);
  padding-top: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-bottom p {
  font-size: 0.82rem;
  color: var(--muted);
  opacity: 0.6;
}

.made-with {
  font-size: 0.75rem;
  opacity: 0.4 !important;
}

.social-btns {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.social-btn {
  width: 36px;
  height: 36px;
  background: var(--bg);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  cursor: pointer;
  border: 1px solid var(--border);
}

.social-btn:hover {
  background: rgba(214, 237, 232, 0.1);
  border-color: rgba(214, 237, 232, 0.3);
}

.social-btn svg {
  width: 16px;
  height: 16px;
  color: var(--muted);
}

@media (max-width: 900px) {
  footer {
    padding: 48px 2rem 32px;
  }

  .footer-top {
    grid-template-columns: 1fr 1fr;
  }
}
</style>