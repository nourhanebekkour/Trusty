<template>
  <div class="landing-page" data-theme="landing">
    <AnimatedBackground />
    <NavbarLanding />

    <!-- HERO -->
    <section id="hero" class="section-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <div class="hero-badge">
            <span class="badge-dot"></span>
            Plateforme certifiée
          </div>
          <h1 class="hero-title">
            Construisez votre avenir<br />
            avec une plateforme<br />
            <span class="gradient-text">intelligente</span>
          </h1>
          <p class="hero-subtitle">
            Gérez portfolios, recommandations, étudiants, professeurs et professionnels<br class="hide-mobile" />
            dans une expérience moderne et connectée.
          </p>
          <div class="hero-actions">
            <button class="btn-gradient" @click="$router.push('/login')">
              Se connecter
            </button>
            <button class="btn-glass" @click="$router.push('/register')">
              Découvrir la plateforme
            </button>
          </div>
          <div class="hero-trust">
            <div class="trust-avatars">
              <span>ML</span><span>YK</span><span>SA</span><span>+2k</span>
            </div>
            <div>
              <div class="trust-stars" aria-label="5 étoiles">
                <AppIcon v-for="n in 5" :key="n" name="star" :size="14" />
              </div>
              <p>Une expérience pensée avec les étudiants et les recruteurs</p>
            </div>
          </div>
          <div class="hero-metrics">
            <div class="metric">
              <span class="metric-value">25k+</span>
              <span class="metric-label">Étudiants</span>
            </div>
            <div class="metric">
              <span class="metric-value">150+</span>
              <span class="metric-label">Partenaires</span>
            </div>
            <div class="metric">
              <span class="metric-value">12k</span>
              <span class="metric-label">Certifications</span>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <HeroScene />
        </div>
      </div>
    </section>

    <!-- ESPACES -->
    <section id="spaces" class="section-spaces">
      <div class="section-label">Trois profils</div>
      <h2 class="section-title">Trois espaces, une plateforme</h2>
      <p class="section-desc">
        Que vous soyez étudiant, professeur ou professionnel, Trusty s'adapte à votre rôle.
      </p>
      <div class="spaces-grid">
        <RoleCard
          icon="graduation"
          title="Espace Étudiant"
          desc="Gérez votre portfolio, vos projets, stages et recommandations en un seul endroit."
          :index="0"
        />
        <RoleCard
          icon="users"
          title="Espace Professeur"
          desc="Validez les compétences, suivez vos étudiants et recommandez leurs travaux."
          :index="1"
        />
        <RoleCard
          icon="briefcase"
          title="Espace Professionnel"
          desc="Consultez les portfolios certifiés et recommandez les talents prometteurs."
          :index="2"
        />
      </div>
    </section>

    <!-- FONCTIONNALITÉS -->
    <section id="features" class="section-features">
      <div class="section-label">Fonctionnalités</div>
      <h2 class="section-title">Tout ce dont vous avez besoin</h2>
      <p class="section-desc">
        Des outils puissants pour gérer l'ensemble du parcours académique et professionnel.
      </p>
      <div class="features-grid">
        <FeatureCard
          v-for="(feat, i) in features"
          :key="feat.title"
          :icon="feat.icon"
          :title="feat.title"
          :desc="feat.desc"
          :index="i"
        />
      </div>
    </section>

    <!-- COMMENT ÇA MARCHE -->
    <section class="section-steps">
      <div class="section-label">Guide</div>
      <h2 class="section-title">Comment ça marche</h2>
      <p class="section-desc">
        Trois étapes simples pour commencer.
      </p>
      <div class="steps-container">
        <div class="steps-line"></div>
        <StepCard
          v-for="(step, i) in steps"
          :key="i"
          :step="step.number"
          :title="step.title"
          :desc="step.desc"
          :index="i"
        />
      </div>
    </section>

    <FooterLanding />
  </div>
</template>

<script setup>
import AnimatedBackground from '@/components/landing/AnimatedBackground.vue'
import NavbarLanding from '@/components/landing/NavbarLanding.vue'
import HeroScene from '@/components/landing/HeroScene.vue'
import RoleCard from '@/components/landing/RoleCard.vue'
import FeatureCard from '@/components/landing/FeatureCard.vue'
import StepCard from '@/components/landing/StepCard.vue'
import FooterLanding from '@/components/landing/FooterLanding.vue'

const features = [
  { icon: 'folder', title: 'Portfolios étudiants', desc: 'Créez et gérez votre portfolio numérique avec projets, stages et compétences validés.' },
  { icon: 'star', title: 'Recommandations', desc: 'Recevez des recommandations de vos professeurs et professionnels du secteur.' },
  { icon: 'building', title: 'Suivi établissement', desc: 'Les professeurs valident et suivent les progrès de chaque étudiant.' },
  { icon: 'briefcase', title: 'Consultation professionnelle', desc: 'Les professionnels accèdent aux portfolios certifiés pour trouver les talents.' },
  { icon: 'bell', title: 'Notifications unifiées', desc: 'Restez informé des validations, recommandations et mises à jour en temps réel.' },
  { icon: 'settings', title: 'Paramètres unifiés', desc: 'Gérez votre profil, vos préférences et votre confidentialité depuis un seul endroit.' },
]

const steps = [
  { number: 1, title: 'Créez votre espace', desc: 'Inscrivez-vous et choisissez votre rôle : étudiant, professeur ou professionnel.' },
  { number: 2, title: 'Complétez vos informations', desc: 'Ajoutez vos projets, compétences, expériences et documents académiques.' },
  { number: 3, title: 'Collaborez et évoluez', desc: 'Recevez des validations, des recommandations et développez votre réseau professionnel.' },
]
</script>

<style scoped>
.landing-page {
  font-family: var(--landing-font);
  color: var(--landing-text);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* ─── Sections communes ─── */
.section-label {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--landing-accent);
  background: rgba(92, 140, 106, 0.12);
  border: 1px solid var(--landing-accent-border);
  padding: 6px 14px;
  border-radius: 999px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 2.4rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.section-desc {
  font-size: 1rem;
  color: var(--landing-text-secondary);
  max-width: 560px;
  line-height: 1.6;
  margin-bottom: 48px;
}

/* ─── Hero ────────────────────────────────────────── */
.section-hero {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 120px 32px 80px;
}

.section-hero::after {
  content: '';
  position: absolute;
  left: 8%;
  right: 8%;
  bottom: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--landing-border-hover), transparent);
}

.hero-inner {
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--landing-accent);
  background: rgba(92, 140, 106, 0.1);
  border: 1px solid var(--landing-accent-border);
  padding: 6px 16px;
  border-radius: 999px;
  width: fit-content;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--landing-accent);
  animation: glow-pulse 2s ease-in-out infinite;
}

.hero-title {
  font-size: clamp(3.1rem, 5vw, 4.65rem);
  font-weight: 800;
  line-height: 1.02;
  letter-spacing: -0.055em;
  text-wrap: balance;
  text-shadow: 0 16px 46px rgba(0, 0, 0, 0.2);
}

.gradient-text {
  background: var(--landing-gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1rem;
  color: var(--landing-text-secondary);
  line-height: 1.7;
  max-width: 520px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.btn-gradient {
  border: none;
  background: var(--landing-gradient-btn);
  color: white;
  padding: 14px 32px;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 18px 40px var(--landing-glow);
  position: relative;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.btn-gradient::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.28) 48%, transparent 72%);
  transform: translateX(-130%);
  transition: transform 0.7s ease;
}

.btn-gradient:hover {
  transform: translateY(-3px);
  box-shadow: 0 22px 50px var(--landing-glow-strong);
}

.btn-gradient:hover::after { transform: translateX(130%); }

.btn-glass {
  background: var(--landing-surface);
  border: 1px solid var(--landing-border);
  color: var(--landing-text);
  padding: 14px 32px;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: background 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
}

.btn-glass:hover {
  background: var(--landing-surface-hover);
  border-color: var(--landing-border-hover);
  transform: translateY(-2px);
}

.hero-metrics {
  display: flex;
  gap: 32px;
  margin-top: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--landing-border);
  width: fit-content;
}

.metric-value {
  display: block;
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--landing-text);
}

.metric-label {
  font-size: 0.78rem;
  color: var(--landing-text-secondary);
  font-weight: 500;
  letter-spacing: 0.04em;
}

.hero-trust {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 2px;
}

.trust-avatars {
  display: flex;
  padding-left: 8px;
}

.trust-avatars span {
  width: 32px;
  height: 32px;
  margin-left: -8px;
  display: grid;
  place-items: center;
  border: 2px solid var(--landing-bg);
  border-radius: 50%;
  background: linear-gradient(145deg, var(--landing-accent), var(--landing-accent-hover));
  color: #fff;
  font-size: 0.55rem;
  font-weight: 800;
  box-shadow: 0 5px 16px rgba(0,0,0,0.2);
}

.trust-avatars span:last-child {
  background: var(--landing-surface);
  color: var(--landing-text);
  border-color: var(--landing-border);
}

.trust-stars {
  color: #fbbf24;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
}

.hero-trust p {
  margin: 3px 0 0;
  color: var(--landing-text-secondary);
  font-size: 0.68rem;
}

/* ─── Espaces ────────────────────────────────────── */
.section-spaces {
  position: relative;
  z-index: 1;
  padding: 100px 32px;
  text-align: center;
  background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--landing-surface) 38%, transparent), transparent);
}

.section-spaces .section-desc {
  margin-left: auto;
  margin-right: auto;
}

.spaces-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

/* ─── Fonctionnalités ────────────────────────────── */
.section-features {
  position: relative;
  z-index: 1;
  padding: 100px 32px;
  text-align: center;
}

.section-features::before {
  content: '';
  position: absolute;
  width: 420px;
  height: 420px;
  right: -160px;
  top: 16%;
  border-radius: 50%;
  background: radial-gradient(circle, var(--landing-glow), transparent 70%);
  filter: blur(30px);
  pointer-events: none;
}

.section-features .section-desc {
  margin-left: auto;
  margin-right: auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

/* ─── Steps ───────────────────────────────────────── */
.section-steps {
  position: relative;
  z-index: 1;
  padding: 100px 32px 120px;
  text-align: center;
}

.section-steps .section-desc {
  margin-left: auto;
  margin-right: auto;
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 640px;
  margin: 0 auto;
  position: relative;
}

.steps-line {
  position: absolute;
  left: 23px;
  top: 24px;
  bottom: 24px;
  width: 2px;
  background: linear-gradient(to bottom, var(--landing-glow-strong), var(--landing-glow));
}

/* ─── Responsive ──────────────────────────────────── */
@media (max-width: 1024px) {
  .hero-title { font-size: 2.6rem; }
  .features-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .hero-inner {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-text { align-items: center; }
  .hero-subtitle { max-width: 100%; }
  .hero-actions { justify-content: center; }
  .hero-metrics { justify-content: center; }
  .hero-visual { display: none; }
  .hero-title { font-size: 2.2rem; }
  .hero-trust { justify-content: center; }
  .hero-metrics { width: 100%; justify-content: center; }
  .section-title { font-size: 1.8rem; }
  .spaces-grid { grid-template-columns: 1fr; }
  .features-grid { grid-template-columns: 1fr; }
  .hide-mobile { display: none; }
}
</style>
