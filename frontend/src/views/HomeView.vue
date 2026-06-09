<template>
  <div class="home">
    <!-- NAVBAR -->
    <nav class="navbar">
      <div class="nav-inner">
        <div class="logo">
          <img src="@/assets/icons/trusty.png" alt="Trusty" class="logo-img" />
          <span class="logo-text">TRUSTY</span>
        </div>
        <div class="nav-links">
          <a href="#" class="nav-link">Voir les portfolios</a>
          <button class="btn-primary btn-sm" @click="$router.push('/login')">Se connecter</button>
        </div>
      </div>
    </nav>

    <!-- HERO -->
    <section class="hero">
      <div class="hero-bg-pattern"></div>
      <div class="container hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">
            Plateforme de<br />
            Portfolios<br />
            Numériques<br />
            <span class="accent">Adaptatifs</span> et<br />
            Certifiés
          </h1>
          <p class="hero-desc">
            Valorisez votre parcours académique et professionnel avec une
            visibilité garantie et des validations institutionnelles qui font la
            différence.
          </p>
          <ul class="hero-features">
            <li><span class="feat-icon">◈</span> Obtenez des validations institutionnelles</li>
            <li><span class="feat-icon">◎</span> Augmentez votre score de crédibilité</li>
          </ul>
          <div class="hero-ctas">
            <button class="btn-primary" @click="$router.push('/login')">Se connecter</button>
            <button class="btn-ghost">Consulter les portfolios</button>
          </div>
        </div>

        <div class="hero-card-wrap">
          <div class="cert-card">
            <div class="cert-card-header">
              <div class="cert-avatar">T</div>
              <div class="cert-info">
                <div class="cert-title">Certificat de Validation</div>
                <div class="cert-sub">Trusty Certified Professional</div>
              </div>
              <div class="cert-badge-icon">🏅</div>
            </div>
            <div class="cert-lines">
              <div class="cert-line w80"></div>
              <div class="cert-line w60"></div>
              <div class="cert-line w90"></div>
            </div>
            <div class="cert-shield">
              <div class="shield-ring">
                <span class="shield-emoji">🛡️</span>
              </div>
            </div>
            <div class="cert-card-footer">
              <div class="cert-avatars">
                <div class="sm-av av1">A</div>
                <div class="sm-av av2">B</div>
                <div class="sm-av av3">C</div>
              </div>
              <span class="cert-footer-text">Validé par les experts</span>
            </div>
          </div>
          <div class="card-glow"></div>
        </div>
      </div>
    </section>

    <!-- STATS -->
    <section class="stats">
      <div class="container stats-grid">
        <div class="stat-item" v-for="stat in stats" :key="stat.label">
          <div class="stat-number">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="features">
      <div class="container">
        <div class="section-tag">Excellence académique</div>
        <h2 class="section-title">Une plateforme conçue pour<br />l'excellence académique</h2>
        <p class="section-desc">
          Nous bridgeons le fossé entre les études et le monde professionnel en apportant une couche
          de confiance technologique.
        </p>

        <div class="features-grid">
          <div class="feature-card" v-for="feat in features" :key="feat.title">
            <div class="feat-card-icon">{{ feat.icon }}</div>
            <h3 class="feat-card-title">{{ feat.title }}</h3>
            <p class="feat-card-desc">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA BANNER -->
    <section class="cta-banner">
      <div class="cta-bg-glow"></div>
      <div class="container cta-inner">
        <div class="cta-text">
          <h2 class="cta-title">Prêt à transformer votre<br />parcours numérique ?</h2>
          <p class="cta-desc">
            Rejoignez des milliers d'étudiants et d'institutions qui font déjà
            confiance à SkillOS pour certifier le talent.
          </p>
          <div class="cta-actions">
            <button class="btn-primary" @click="$router.push('/login')">Mon Portfolio</button>
            <a href="#" class="cta-link">En savoir plus →</a>
          </div>
        </div>
        <div class="cta-orb">
          <div class="orb-ring orb-ring-1"></div>
          <div class="orb-ring orb-ring-2"></div>
          <div class="orb-core">🛡️</div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="container footer-inner">
        <div class="logo">
          <img src="@/assets/icons/trusty.png" alt="Trusty" class="logo-img" />
          <span class="logo-text">TRUSTY</span>
        </div>
        <p class="footer-copy">© 2026 Trusty. Tous droits réservés.</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      stats: [
        { value: '25k+', label: 'ÉTUDIANTS ACTIFS' },
        { value: '150+', label: 'PARTENAIRES' },
        { value: '12k', label: 'CERTIFICATIONS' },
        { value: '94%', label: "TAUX D'EMBAUCHÉ" },
      ],
      features: [
        {
          icon: '◈',
          title: 'Validation Institutionnelle',
          desc: "Vos projets, stages et diplômes sont vérifiés directement par vos professeurs et les entreprises partenaires.",
        },
        {
          icon: '⬡',
          title: 'Score de Crédibilité',
          desc: "Plus vous accumulez de recommandations et de validations, plus votre indice de confiance augmente sur le marché.",
        },
        {
          icon: '◎',
          title: 'Visibilité Mondiale',
          desc: "Exportez votre portfolio certifié sous format numérique vérifiable, accessible partout dans le monde.",
        },
        {
          icon: '◇',
          title: 'Badges Compétences',
          desc: "Débloquez des badges officiels basés sur vos réalisations concrètes et validés par des experts du domaine.",
        },
        {
          icon: '▣',
          title: 'Recrutement Simplifié',
          desc: "Les recruteurs accèdent à des données certifiées, réduisant le temps de sourcing et de vérification des CV.",
        },
        {
          icon: '⊕',
          title: 'Sécurité & Confidentialité',
          desc: "Contrôlez qui voit quoi. Votre portfolio est protégé par des protocoles de sécurité de niveau bancaire.",
        },
      ],
    }
  },
}
</script>

<style scoped>
/* ─── CSS VARIABLES ─────────────────────────────── */
:root {
  --bg: #0d2b2b;
  --surface: #1a3838;
  --mint: #d6ede8;
  --olive: #5c8c6a;
  --gray: #3d3d3d;
  --petrol: #0d2b2b;
  --accent: #5c8c6a;
  --text-primary: #d6ede8;
  --text-muted: #8ab5aa;
}

/* ─── RESET & BASE ──────────────────────────────── */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.home {
  font-family: 'Georgia', 'Times New Roman', serif;
  background-color: #0d2b2b;
  color: #d6ede8;
  min-height: 100vh;
  overflow-x: hidden;
}

.container {
  max-width: 100%;
  margin: 0;
  padding: 0 4rem;
}

/* ─── NAVBAR ────────────────────────────────────── */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(13, 43, 43, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(214, 237, 232, 0.08);
}

.nav-inner {
  max-width: 100%;
  margin: 0;
  padding: 0 4rem;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-img {
  height: 48px; width: auto; object-fit: contain;
}

.logo-text {
  font-family: 'Georgia', serif;
  font-size: 1.1rem;
  font-weight: bold;
  letter-spacing: 0.15em;
  color: #d6ede8;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: #8ab5aa;
  text-decoration: none;
  font-size: 0.85rem;
  letter-spacing: 0.03em;
  transition: color 0.2s;
}

.nav-link:hover { color: #d6ede8; }

/* ─── BUTTONS ───────────────────────────────────── */
.btn-primary {
  background: #5c8c6a;
  color: #0d2b2b;
  border: none;
  padding: 0.65rem 1.5rem;
  border-radius: 6px;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}

.btn-primary:hover {
  background: #6fa87e;
  transform: translateY(-1px);
}

.btn-sm { padding: 0.45rem 1.1rem; font-size: 0.82rem; }

.btn-ghost {
  background: transparent;
  color: #d6ede8;
  border: 1px solid rgba(214, 237, 232, 0.3);
  padding: 0.65rem 1.5rem;
  border-radius: 6px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.btn-ghost:hover {
  height: 28px;
  width: auto;
  object-fit: contain;
  background: rgba(92, 140, 106, 0.08);
}

/* ─── HERO ──────────────────────────────────────── */
.hero {
  position: relative;
  background: linear-gradient(135deg, #0d2b2b 0%, #112f2f 60%, #0f2626 100%);
  padding: 5rem 0 4rem;
  overflow: hidden;
}

.hero-bg-pattern {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 80% 20%, rgba(92, 140, 106, 0.07) 0%, transparent 50%),
    radial-gradient(circle at 10% 80%, rgba(92, 140, 106, 0.05) 0%, transparent 40%);
  pointer-events: none;
}

.hero-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-title {
  font-size: 2.8rem;
  font-weight: 800;
  line-height: 1.15;
  color: #d6ede8;
  letter-spacing: -0.02em;
  margin-bottom: 1.2rem;
}

.accent { height: 28px; width: auto; object-fit: contain; font-style: italic; }

.hero-desc {
  color: #8ab5aa;
  font-size: 0.92rem;
  line-height: 1.7;
  max-width: 400px;
  margin-bottom: 1.5rem;
}

.hero-features {
  list-style: none;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.hero-features li {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.88rem;
  color: #b5d8d0;
}

.feat-icon {
  height: 28px; width: auto; object-fit: contain;
  font-size: 1rem;
}

.hero-ctas {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* ─── CERTIFICATE CARD ──────────────────────────── */
.hero-card-wrap {
  position: relative;
  display: flex;
  justify-content: center;
}

.cert-card {
  background: #fff;
  border-radius: 16px;
  padding: 1.4rem;
  width: 280px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.06);
  color: #1a3838;
  position: relative;
  z-index: 2;
}

.cert-card-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.cert-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #0d2b2b;
  color: #d6ede8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.cert-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0d2b2b;
}

.cert-sub {
  font-size: 0.7rem;
  color: #8ab5aa;
}

.cert-badge-icon {
  margin-left: auto;
  font-size: 1.1rem;
}

.cert-lines {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-bottom: 1.2rem;
}

.cert-line {
  height: 8px;
  background: #e8f5f2;
  border-radius: 4px;
}
.w80 { width: 80%; }
.w60 { width: 60%; }
.w90 { width: 90%; }

.cert-shield {
  display: flex;
  justify-content: center;
  margin-bottom: 1.2rem;
}

.shield-ring {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px dashed rgba(92, 140, 106, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(214, 237, 232, 0.3);
}

.shield-emoji { font-size: 1.6rem; }

.cert-card-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cert-avatars { display: flex; }

.sm-av {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 700;
  color: #d6ede8;
  margin-left: -6px;
}
.sm-av:first-child { margin-left: 0; }
.av1 { background: #5c8c6a; }
.av2 { background: #0d2b2b; }
.av3 { background: #3d3d3d; }

.cert-footer-text {
  font-size: 0.68rem;
  height: 28px; width: auto; object-fit: contain;
  margin-left: 0.4rem;
}

.card-glow {
  position: absolute;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(92, 140, 106, 0.2) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1;
}

/* ─── STATS ─────────────────────────────────────── */
.stats {
  background: #1a3838;
  border-top: 1px solid rgba(214, 237, 232, 0.06);
  border-bottom: 1px solid rgba(214, 237, 232, 0.06);
  padding: 2.5rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  text-align: center;
}

.stat-number {
  font-size: 2.2rem;
  font-weight: 800;
  color: #d6ede8;
  font-family: 'Georgia', serif;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  height: 28px; width: auto; object-fit: contain;
  font-weight: 600;
  margin-top: 0.3rem;
}

/* ─── FEATURES ──────────────────────────────────── */
.features {
  padding: 5rem 0;
  background: #0d2b2b;
}

.section-tag {
  display: inline-block;
  background: rgba(92, 140, 106, 0.15);
  height: 28px; width: auto; object-fit: contain;
  border: 1px solid rgba(92, 140, 106, 0.3);
  padding: 0.3rem 0.9rem;
  border-radius: 20px;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  font-weight: 600;
  margin-bottom: 1.2rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 800;
  color: #d6ede8;
  text-align: center;
  margin-bottom: 0.8rem;
  line-height: 1.25;
}

.section-desc {
  text-align: center;
  color: #8ab5aa;
  font-size: 0.9rem;
  max-width: 520px;
  margin: 0 auto 3rem;
  line-height: 1.7;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.feature-card {
  background: #1a3838;
  border: 1px solid rgba(214, 237, 232, 0.07);
  border-radius: 12px;
  padding: 1.6rem;
  transition: border-color 0.2s, transform 0.2s;
}

.feature-card:hover {
  border-color: rgba(92, 140, 106, 0.4);
  transform: translateY(-3px);
}

.feat-card-icon {
  font-size: 1.4rem;
  height: 28px; width: auto; object-fit: contain;
  margin-bottom: 0.8rem;
}

.feat-card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #d6ede8;
  margin-bottom: 0.5rem;
}

.feat-card-desc {
  font-size: 0.82rem;
  color: #8ab5aa;
  line-height: 1.65;
}

/* ─── CTA BANNER ────────────────────────────────── */
.cta-banner {
  background: #122e2e;
  border-top: 1px solid rgba(92, 140, 106, 0.15);
  border-bottom: 1px solid rgba(92, 140, 106, 0.15);
  padding: 4rem 0;
  position: relative;
  overflow: hidden;
}

.cta-bg-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 70% 50%, rgba(92, 140, 106, 0.08) 0%, transparent 60%);
  pointer-events: none;
}

.cta-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 3rem;
  position: relative;
  z-index: 2;
}

.cta-title {
  font-size: 1.9rem;
  font-weight: 800;
  color: #d6ede8;
  margin-bottom: 0.8rem;
  line-height: 1.2;
}

.cta-desc {
  color: #8ab5aa;
  font-size: 0.88rem;
  line-height: 1.7;
  max-width: 440px;
  margin-bottom: 1.8rem;
}

.cta-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.cta-link {
  color: #8ab5aa;
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s;
}

.cta-link:hover { color: #d6ede8; }

/* ─── ORB ───────────────────────────────────────── */
.cta-orb {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.orb-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(92, 140, 106, 0.25);
  animation: orb-spin 8s linear infinite;
}

.orb-ring-1 {
  width: 120px;
  height: 120px;
}

.orb-ring-2 {
  width: 86px;
  height: 86px;
  border-style: dashed;
  animation-direction: reverse;
  animation-duration: 5s;
}

.orb-core {
  width: 56px;
  height: 56px;
  background: rgba(92, 140, 106, 0.15);
  border: 1px solid rgba(92, 140, 106, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  position: relative;
  z-index: 2;
}

@keyframes orb-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ─── FOOTER ────────────────────────────────────── */
.footer {
  background: #091f1f;
  padding: 1.8rem 0;
  border-top: 1px solid rgba(214, 237, 232, 0.06);
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-copy {
  font-size: 0.78rem;
  height: 28px; width: auto; object-fit: contain;
}

/* ─── RESPONSIVE ────────────────────────────────── */
@media (max-width: 768px) {
  .hero-inner {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }

  .hero-title { font-size: 2rem; }

  .hero-card-wrap { justify-content: flex-start; }

  .stats-grid { grid-template-columns: repeat(2, 1fr); }

  .features-grid { grid-template-columns: 1fr; }

  .cta-inner { flex-direction: column; }

  .cta-orb { display: none; }
}
</style>