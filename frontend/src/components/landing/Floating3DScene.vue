<template>
  <div class="scene-3d" :style="{ perspective: `${perspective}px` }">
    <div
      v-for="(shape, i) in shapes"
      :key="i"
      class="shape"
      :class="[`shape--${shape.type}`, shape.class]"
      :style="getShapeStyle(shape, i)"
    >
      <div v-if="shape.type === 'torus'" class="torus-inner"></div>
      <div v-if="shape.type === 'hexagon'" class="hex-inner"></div>
      <div v-if="shape.type === 'label'" class="shape-label glass-card">{{ shape.label }}</div>
    </div>
  </div>
</template>

<script setup>
import { useMouseParallax } from '@/composables/useMouseParallax'

const props = defineProps({
  shapes: {
    type: Array,
    default: () => []
  },
  perspective: {
    type: Number,
    default: 900
  },
  parallaxIntensity: {
    type: Number,
    default: 1
  }
})

const { mouseX, mouseY } = useMouseParallax()

function getShapeStyle(shape, i) {
  const pos = shape.position || [0, 0, 0]
  const color = shape.color || 'rgba(255,255,255,0.1)'
  const size = shape.size || 80
  const speed = shape.speed || (4 + (i * 0.7))
  const delay = shape.delay || -(i * 1.2)

  const parallaxFactor = shape.type === 'label' ? 0.3 : 1
  const translateX = mouseX.value * props.parallaxIntensity * (pos[2] ? Math.abs(pos[2]) * 0.02 + 1 : 1) * 15 * parallaxFactor
  const translateY = mouseY.value * props.parallaxIntensity * (pos[2] ? Math.abs(pos[2]) * 0.02 + 1 : 1) * 15 * parallaxFactor

  return {
    '--shape-color': color,
    '--shape-size': `${size}px`,
    '--shape-speed': `${speed}s`,
    '--shape-delay': `${delay}s`,
    transform: `translate3d(${pos[0]}px, ${pos[1]}px, ${pos[2] || 0}px) translateX(${translateX}px) translateY(${translateY}px)`,
  }
}
</script>

<style scoped>
.scene-3d {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.shape {
  position: absolute;
  transform-style: preserve-3d;
  will-change: transform;
  transition: transform 0.1s ease-out;
}

/* ─── Box (cube) ─────────────── */
.shape--box {
  width: var(--shape-size);
  height: var(--shape-size);
  background: var(--shape-color);
  border-radius: 18%;
  border: 1px solid rgba(255,255,255,0.12);
  animation: float-rotate-box var(--shape-speed) linear infinite,
             float-up-down calc(var(--shape-speed) * 0.7) ease-in-out infinite;
  animation-delay: var(--shape-delay), var(--shape-delay);
  box-shadow: 0 0 40px var(--shape-color), inset 0 0 20px rgba(255,255,255,0.05);
}

/* ─── Torus (ring) ───────────── */
.shape--torus {
  width: var(--shape-size);
  height: var(--shape-size);
  border-radius: 50%;
  border: 3px solid var(--shape-color);
  box-shadow: 0 0 40px var(--shape-color), inset 0 0 20px rgba(255,255,255,0.05);
  animation: float-rotate-torus var(--shape-speed) linear infinite,
             float-up-down calc(var(--shape-speed) * 0.8) ease-in-out infinite;
  animation-delay: var(--shape-delay), var(--shape-delay);
  display: flex;
  align-items: center;
  justify-content: center;
}

.torus-inner {
  width: 60%;
  height: 60%;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,0.08);
}

/* ─── Capsule ────────────────── */
.shape--capsule {
  width: calc(var(--shape-size) * 0.35);
  height: var(--shape-size);
  background: var(--shape-color);
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 0 35px var(--shape-color);
  animation: float-up-down var(--shape-speed) ease-in-out infinite;
  animation-delay: var(--shape-delay);
}

/* ─── Diamond ────────────────── */
.shape--diamond {
  width: var(--shape-size);
  height: var(--shape-size);
  background: var(--shape-color);
  border: 1px solid rgba(255,255,255,0.12);
  transform-origin: center;
  animation: float-rotate-diamond var(--shape-speed) linear infinite,
             float-up-down calc(var(--shape-speed) * 0.75) ease-in-out infinite;
  animation-delay: var(--shape-delay), var(--shape-delay);
  box-shadow: 0 0 30px var(--shape-color), inset 0 0 15px rgba(255,255,255,0.05);
}

/* ─── Hexagon ────────────────── */
.shape--hexagon {
  width: var(--shape-size);
  height: calc(var(--shape-size) * 0.866);
  background: var(--shape-color);
  border: 1px solid rgba(255,255,255,0.1);
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  box-shadow: 0 0 35px var(--shape-color);
  animation: float-rotate-hexagon var(--shape-speed) linear infinite,
             float-up-down calc(var(--shape-speed) * 0.65) ease-in-out infinite;
  animation-delay: var(--shape-delay), var(--shape-delay);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hex-inner {
  width: 50%;
  height: 50%;
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  background: rgba(255,255,255,0.05);
  border: none;
}

/* ─── Label floating card ────── */
.shape--label {
  animation: float-up-down var(--shape-speed) ease-in-out infinite;
  animation-delay: var(--shape-delay);
}

.shape-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 8px 18px;
  white-space: nowrap;
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
  pointer-events: none;
  letter-spacing: 0.02em;
}

@keyframes float-rotate-box {
  0%   { transform: rotateX(0deg) rotateY(0deg); }
  100% { transform: rotateX(360deg) rotateY(360deg); }
}

@keyframes float-rotate-torus {
  0%   { transform: rotateX(0deg) rotateY(0deg); }
  100% { transform: rotateX(360deg) rotateY(360deg); }
}

@keyframes float-rotate-diamond {
  0%   { transform: rotateZ(0deg) rotateX(10deg) rotateY(10deg); }
  100% { transform: rotateZ(360deg) rotateX(10deg) rotateY(10deg); }
}

@keyframes float-rotate-hexagon {
  0%   { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
}
</style>
