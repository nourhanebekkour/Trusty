<template>
  <div class="landing-bg" aria-hidden="true">
    <div class="aurora aurora-1"></div>
    <div class="aurora aurora-2"></div>
    <div class="aurora aurora-3"></div>
    <div class="particles-layer particles-layer--near">
      <div v-for="p in nearParticles" :key="'n'+p.id" class="particle" :class="'particle--size-' + p.sizeClass" :style="p.style"></div>
    </div>
    <div class="particles-layer particles-layer--far">
      <div v-for="p in farParticles" :key="'f'+p.id" class="particle particle--far" :style="p.style"></div>
    </div>
    <div class="grid-overlay"></div>
    <div class="vignette"></div>
    <div class="glow-mesh"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const nearParticles = ref([])
const farParticles = ref([])

for (let i = 0; i < 80; i++) {
  const size = 1.5 + Math.random() * 3
  const sizeClass = size > 3 ? 'lg' : size > 2 ? 'md' : 'sm'
  nearParticles.value.push({
    id: i,
    sizeClass,
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDuration: `${14 + Math.random() * 20}s`,
      animationDelay: `${-(Math.random() * 14)}s`,
      opacity: 0.08 + Math.random() * 0.18,
    }
  })
}

for (let i = 0; i < 40; i++) {
  const size = 0.8 + Math.random() * 1.5
  farParticles.value.push({
    id: i,
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDuration: `${22 + Math.random() * 28}s`,
      animationDelay: `${-(Math.random() * 20)}s`,
      opacity: 0.04 + Math.random() * 0.08,
    }
  })
}
</script>

<style scoped>
.landing-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  background: var(--landing-bg-gradient);
}

.aurora {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
  animation: aurora-drift 20s ease-in-out infinite alternate;
}

.aurora-1 {
  width: 700px;
  height: 700px;
  top: -250px;
  left: -200px;
  background: radial-gradient(circle, var(--landing-aurora-1) 0%, transparent 70%);
  animation-duration: 24s;
}

.aurora-2 {
  width: 550px;
  height: 550px;
  bottom: -200px;
  right: -150px;
  background: radial-gradient(circle, var(--landing-aurora-2) 0%, transparent 70%);
  animation-duration: 20s;
  animation-delay: -7s;
}

.aurora-3 {
  width: 450px;
  height: 450px;
  top: 35%;
  left: 55%;
  background: radial-gradient(circle, var(--landing-aurora-3) 0%, transparent 70%);
  animation-duration: 28s;
  animation-delay: -12s;
}

.particles-layer {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: var(--landing-particle);
  animation: particle-float-landing linear infinite;
}

.particle--far {
  animation-duration: 30s;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--landing-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--landing-grid) 1px, transparent 1px);
  background-size: 80px 80px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 70%);
}

.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 50% at 50% 50%, transparent 40%, rgba(0,0,0,0.25) 100%);
  pointer-events: none;
}

.glow-mesh {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1px 1px at 20% 30%, var(--landing-particle) 0%, transparent 100%),
    radial-gradient(1px 1px at 80% 20%, var(--landing-particle) 0%, transparent 100%),
    radial-gradient(1px 1px at 40% 80%, var(--landing-particle) 0%, transparent 100%),
    radial-gradient(1px 1px at 70% 60%, var(--landing-particle) 0%, transparent 100%);
  background-size: 200px 200px;
  opacity: 0.3;
}
</style>
