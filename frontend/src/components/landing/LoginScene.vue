<template>
  <div class="login-scene-wrapper" aria-hidden="true">
    <div class="login-orb"></div>
    <div class="network-card">
      <div class="network-head">
        <span class="network-label">Réseau TRUSTY</span>
        <span class="network-live"><i></i> Actif</span>
      </div>
      <div class="network-center">
        <div class="profile-ring">
          <div class="profile-avatar">ML</div>
          <span class="profile-check">✓</span>
        </div>
        <strong>Profil certifié</strong>
        <small>Score de crédibilité 92/100</small>
      </div>
      <div class="network-nodes">
        <div class="node node--one"><span>PR</span><small>Professeur</small></div>
        <div class="node node--two"><span>RH</span><small>Recruteur</small></div>
        <div class="node node--three"><span>ET</span><small>Étudiant</small></div>
      </div>
      <svg class="network-lines" viewBox="0 0 400 360" preserveAspectRatio="none">
        <path d="M200 180 C145 145 112 110 78 82" />
        <path d="M200 180 C270 145 302 112 330 86" />
        <path d="M200 180 C210 245 255 275 300 300" />
      </svg>
      <div class="network-footer">
        <div><strong>12</strong><span>validations</span></div>
        <div><strong>8</strong><span>projets</span></div>
        <div><strong>6</strong><span>recommandations</span></div>
      </div>
    </div>
    <div class="scene-note scene-note--top">Portfolio publié <span>✓</span></div>
    <div class="scene-note scene-note--bottom"><span>+24%</span> de visibilité</div>
  </div>
</template>

<style scoped>
.login-scene-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
  display: grid;
  place-items: center;
  perspective: 1000px;
}

.login-orb {
  position: absolute;
  width: 390px;
  height: 390px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--landing-glow-strong), transparent 68%);
  filter: blur(28px);
}

.network-card {
  position: relative;
  width: min(390px, 92%);
  height: 430px;
  padding: 22px;
  border-radius: 30px;
  border: 1px solid var(--landing-border-hover);
  background: color-mix(in srgb, var(--landing-bg) 76%, transparent);
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.42), inset 0 1px rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(26px) saturate(135%);
  transform: rotateY(-7deg) rotateX(3deg);
  animation: login-card-float 7s ease-in-out infinite;
  overflow: hidden;
}

.network-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(145deg, rgba(255,255,255,0.08), transparent 34%);
  pointer-events: none;
}

.network-head { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 2; }
.network-label { color: var(--landing-text); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.network-live { display: flex; align-items: center; gap: 5px; color: var(--landing-text-secondary); font-size: 0.6rem; }
.network-live i { width: 6px; height: 6px; border-radius: 50%; background: #34d399; box-shadow: 0 0 10px #34d399; }

.network-center {
  position: absolute;
  z-index: 3;
  left: 50%;
  top: 46%;
  transform: translate(-50%, -50%);
  text-align: center;
}
.profile-ring { position: relative; width: 106px; height: 106px; margin: 0 auto 12px; border-radius: 50%; padding: 8px; background: conic-gradient(var(--landing-accent), var(--landing-accent-light), var(--landing-accent)); box-shadow: 0 0 45px var(--landing-glow-strong); }
.profile-avatar { width: 100%; height: 100%; display: grid; place-items: center; border: 7px solid var(--landing-bg); border-radius: 50%; background: var(--landing-gradient-btn); color: #fff; font-size: 1.35rem; font-weight: 900; }
.profile-check { position: absolute; right: 1px; bottom: 8px; width: 26px; height: 26px; display: grid; place-items: center; border: 4px solid var(--landing-bg); border-radius: 50%; background: #34d399; color: #06281e; font-size: 0.7rem; font-weight: 900; }
.network-center strong, .network-center small { display: block; white-space: nowrap; }
.network-center strong { color: var(--landing-text); font-size: 0.82rem; }
.network-center small { color: var(--landing-text-secondary); font-size: 0.6rem; margin-top: 4px; }

.network-lines { position: absolute; inset: 42px 0 55px; width: 100%; height: calc(100% - 97px); z-index: 1; }
.network-lines path { fill: none; stroke: var(--landing-accent-border); stroke-width: 1; stroke-dasharray: 5 6; opacity: 0.65; animation: line-flow 10s linear infinite; }

.node { position: absolute; z-index: 3; display: flex; align-items: center; gap: 7px; color: var(--landing-text-secondary); font-size: 0.55rem; }
.node span { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 12px; border: 1px solid var(--landing-border-hover); background: var(--landing-surface); color: var(--landing-text); font-size: 0.62rem; font-weight: 800; box-shadow: 0 10px 25px rgba(0,0,0,0.24); }
.node--one { left: 25px; top: 82px; }
.node--two { right: 22px; top: 87px; flex-direction: row-reverse; }
.node--three { right: 48px; bottom: 88px; flex-direction: row-reverse; }

.network-footer { position: absolute; left: 20px; right: 20px; bottom: 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; z-index: 3; }
.network-footer div { padding: 9px 6px; border: 1px solid var(--landing-border); border-radius: 12px; background: var(--landing-surface); text-align: center; }
.network-footer strong, .network-footer span { display: block; }
.network-footer strong { color: var(--landing-text); font-size: 0.78rem; }
.network-footer span { color: var(--landing-text-secondary); font-size: 0.48rem; margin-top: 2px; }

.scene-note { position: absolute; z-index: 4; padding: 9px 13px; border: 1px solid var(--landing-border-hover); border-radius: 12px; background: color-mix(in srgb, var(--landing-bg) 74%, transparent); color: var(--landing-text); font-size: 0.62rem; font-weight: 700; box-shadow: 0 16px 38px rgba(0,0,0,0.3); backdrop-filter: blur(16px); animation: note-float 5s ease-in-out infinite; }
.scene-note--top { top: 58px; right: -8px; }
.scene-note--top span { color: #34d399; margin-left: 5px; }
.scene-note--bottom { bottom: 50px; left: -4px; animation-delay: -2.5s; }
.scene-note--bottom span { color: var(--landing-accent-light); margin-right: 4px; }

@keyframes login-card-float {
  0%, 100% { transform: rotateY(-7deg) rotateX(3deg) translateY(0); }
  50% { transform: rotateY(-4deg) rotateX(1deg) translateY(-10px); }
}
@keyframes note-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes line-flow {
  to { stroke-dashoffset: -100; }
}

@media (max-width: 768px) {
  .login-scene-wrapper {
    display: none;
  }
}
</style>
