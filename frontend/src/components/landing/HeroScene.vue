<template>
  <div class="hero-scene-wrapper" aria-hidden="true">
    <div class="scene-glow"></div>
    <div class="orbit orbit--one"></div>
    <div class="orbit orbit--two"></div>

    <div class="product-window">
      <div class="window-bar">
        <div class="window-dots"><span></span><span></span><span></span></div>
        <div class="window-address">trusty.app/portfolio</div>
        <div class="window-status"><span></span> Vérifié</div>
      </div>

      <div class="window-body">
        <aside class="preview-sidebar">
          <div class="preview-logo">T</div>
          <span class="side-pill side-pill--active"></span>
          <span class="side-pill"></span>
          <span class="side-pill"></span>
          <span class="side-pill"></span>
        </aside>

        <div class="preview-main">
          <div class="preview-head">
            <div>
              <span class="preview-kicker">Portfolio certifié</span>
              <h3>Marguerite Lucas</h3>
              <p>Ingénierie logicielle · Promotion 2026</p>
            </div>
            <div class="score-ring"><strong>92</strong><span>/100</span></div>
          </div>

          <div class="preview-stats">
            <div><strong>8</strong><span>Projets</span></div>
            <div><strong>12</strong><span>Compétences</span></div>
            <div><strong>6</strong><span>Validations</span></div>
          </div>

          <div class="preview-content">
            <div class="project-preview">
              <div class="project-cover">
                <span class="cover-code">&lt;/&gt;</span>
                <span class="verified-chip">Certifié</span>
              </div>
              <div class="project-copy">
                <span>Projet de fin d'études</span>
                <strong>Plateforme collaborative</strong>
                <div class="skill-row"><i></i><i></i><i></i></div>
              </div>
            </div>
            <div class="activity-preview">
              <span class="activity-title">Activité récente</span>
              <div class="activity-line"><i></i><span><strong>Projet validé</strong><small>Il y a 2 h</small></span></div>
              <div class="activity-line"><i></i><span><strong>Nouvelle recommandation</strong><small>Aujourd'hui</small></span></div>
              <div class="activity-line"><i></i><span><strong>Portfolio publié</strong><small>Hier</small></span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="floating-card floating-card--validation">
      <span class="floating-icon">✓</span>
      <div><strong>Compétence validée</strong><small>Architecture logicielle</small></div>
    </div>

    <div class="floating-card floating-card--recommendation">
      <span class="avatar-stack">ML</span>
      <div><strong>Nouvelle recommandation</strong><small>Profil professionnel renforcé</small></div>
    </div>
  </div>
</template>

<style scoped>
.hero-scene-wrapper {
  position: relative;
  width: 100%;
  height: 560px;
  perspective: 1200px;
  isolation: isolate;
}

.scene-glow {
  position: absolute;
  inset: 12% 4%;
  border-radius: 50%;
  background: radial-gradient(circle, var(--landing-glow-strong), transparent 66%);
  filter: blur(35px);
  opacity: 0.75;
}

.orbit {
  position: absolute;
  border: 1px solid color-mix(in srgb, var(--landing-accent-border) 34%, transparent);
  border-radius: 50%;
  transform: rotate(-16deg);
}

.orbit--one { width: 470px; height: 470px; top: 34px; left: 58px; }
.orbit--two { width: 370px; height: 370px; top: 84px; left: 108px; transform: rotate(22deg); }

.product-window {
  position: absolute;
  width: min(550px, 94%);
  left: 50%;
  top: 50%;
  border: 1px solid var(--landing-border-hover);
  border-radius: 24px;
  overflow: hidden;
  background: color-mix(in srgb, var(--landing-bg) 82%, transparent);
  box-shadow: 0 40px 100px var(--landing-shadow-card), 0 0 60px var(--landing-glow);
  backdrop-filter: blur(24px) saturate(130%);
  transform: translate(-50%, -50%) rotateY(-8deg) rotateX(4deg);
  animation: window-float 7s ease-in-out infinite;
}

.window-bar {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  border-bottom: 1px solid var(--landing-border);
  background: color-mix(in srgb, var(--landing-surface) 85%, transparent);
}

.window-dots { display: flex; gap: 6px; }
.window-dots span { width: 7px; height: 7px; border-radius: 50%; background: var(--landing-border-hover); }
.window-dots span:first-child { background: #f87171; }
.window-dots span:nth-child(2) { background: #fbbf24; }
.window-dots span:last-child { background: #34d399; }

.window-address {
  flex: 1;
  padding: 5px 12px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--landing-bg) 65%, transparent);
  color: var(--landing-text-secondary);
  font-size: 0.64rem;
}

.window-status { display: flex; align-items: center; gap: 5px; color: var(--landing-text-secondary); font-size: 0.62rem; font-weight: 700; }
.window-status span { width: 6px; height: 6px; border-radius: 50%; background: #34d399; box-shadow: 0 0 10px #34d399; }

.window-body { display: flex; min-height: 375px; }
.preview-sidebar {
  width: 62px;
  padding: 18px 13px;
  border-right: 1px solid var(--landing-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.preview-logo { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 9px; background: var(--landing-gradient-btn); color: #fff; font-size: 0.8rem; font-weight: 900; box-shadow: 0 8px 20px var(--landing-glow); }
.side-pill { width: 22px; height: 5px; border-radius: 9px; background: var(--landing-border); }
.side-pill--active { height: 22px; background: color-mix(in srgb, var(--landing-accent) 34%, transparent); border: 1px solid var(--landing-accent-border); }

.preview-main { flex: 1; padding: 24px; min-width: 0; }
.preview-head { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
.preview-kicker { color: var(--landing-accent); font-size: 0.6rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
.preview-head h3 { margin: 4px 0 2px; color: var(--landing-text); font-size: 1.15rem; }
.preview-head p { color: var(--landing-text-secondary); font-size: 0.66rem; }

.score-ring {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  display: grid;
  place-content: center;
  text-align: center;
  background: radial-gradient(circle at center, var(--landing-bg) 57%, transparent 59%), conic-gradient(var(--landing-accent) 92%, var(--landing-border) 0);
  box-shadow: 0 0 22px var(--landing-glow);
}
.score-ring strong { color: var(--landing-text); font-size: 0.92rem; line-height: 1; }
.score-ring span { color: var(--landing-text-secondary); font-size: 0.5rem; }

.preview-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 22px 0 16px; }
.preview-stats div { padding: 10px; border: 1px solid var(--landing-border); border-radius: 12px; background: var(--landing-surface); }
.preview-stats strong, .preview-stats span { display: block; }
.preview-stats strong { color: var(--landing-text); font-size: 0.9rem; }
.preview-stats span { color: var(--landing-text-secondary); font-size: 0.55rem; }

.preview-content { display: grid; grid-template-columns: 1.08fr 0.92fr; gap: 12px; }
.project-preview, .activity-preview { border: 1px solid var(--landing-border); border-radius: 15px; background: var(--landing-surface); overflow: hidden; }
.project-cover { height: 86px; position: relative; display: grid; place-items: center; background: linear-gradient(135deg, rgba(92, 140, 106, 0.32), rgba(168, 206, 197, 0.08)); }
.cover-code { color: var(--landing-accent-light); font-size: 1.45rem; font-weight: 900; text-shadow: 0 0 20px var(--landing-glow-strong); }
.verified-chip { position: absolute; right: 8px; top: 8px; padding: 3px 7px; border-radius: 999px; background: rgba(52, 211, 153, 0.16); border: 1px solid rgba(52, 211, 153, 0.35); color: #6ee7b7; font-size: 0.48rem; font-weight: 800; }
.project-copy { padding: 11px; }
.project-copy span, .project-copy strong { display: block; }
.project-copy span { color: var(--landing-text-secondary); font-size: 0.52rem; }
.project-copy strong { color: var(--landing-text); font-size: 0.67rem; margin: 3px 0 9px; }
.skill-row { display: flex; gap: 5px; }
.skill-row i { width: 28px; height: 5px; border-radius: 99px; background: var(--landing-accent); opacity: 0.65; }
.skill-row i:nth-child(2) { width: 20px; opacity: 0.45; }
.skill-row i:nth-child(3) { width: 34px; opacity: 0.3; }

.activity-preview { padding: 12px; }
.activity-title { display: block; color: var(--landing-text); font-size: 0.62rem; font-weight: 800; margin-bottom: 10px; }
.activity-line { display: flex; gap: 8px; align-items: flex-start; padding: 7px 0; border-top: 1px solid var(--landing-border); }
.activity-line i { width: 7px; height: 7px; margin-top: 3px; flex: 0 0 auto; border-radius: 50%; background: var(--landing-accent); box-shadow: 0 0 10px var(--landing-glow-strong); }
.activity-line span, .activity-line strong, .activity-line small { display: block; }
.activity-line strong { color: var(--landing-text); font-size: 0.53rem; }
.activity-line small { color: var(--landing-text-secondary); font-size: 0.47rem; margin-top: 2px; }

.floating-card {
  position: absolute;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border: 1px solid var(--landing-border-hover);
  border-radius: 14px;
  background: color-mix(in srgb, var(--landing-bg) 75%, transparent);
  box-shadow: 0 20px 46px var(--landing-shadow-hover);
  backdrop-filter: blur(18px);
  animation: badge-float 5s ease-in-out infinite;
}
.floating-card--validation { top: 58px; right: -18px; }
.floating-card--recommendation { bottom: 52px; left: -14px; animation-delay: -2.5s; }
.floating-icon, .avatar-stack { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 10px; background: var(--landing-gradient-btn); color: #fff; font-size: 0.7rem; font-weight: 900; box-shadow: 0 8px 20px var(--landing-glow); }
.floating-card strong, .floating-card small { display: block; }
.floating-card strong { color: var(--landing-text); font-size: 0.62rem; }
.floating-card small { color: var(--landing-text-secondary); font-size: 0.52rem; margin-top: 2px; }

@keyframes window-float {
  0%, 100% { transform: translate(-50%, -50%) rotateY(-8deg) rotateX(4deg) translateY(0); }
  50% { transform: translate(-50%, -50%) rotateY(-5deg) rotateX(2deg) translateY(-10px); }
}

@keyframes badge-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-9px); }
}

@media (max-width: 768px) {
  .hero-scene-wrapper {
    display: none;
  }
}
</style>
