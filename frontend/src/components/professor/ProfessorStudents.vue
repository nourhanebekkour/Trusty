<template>
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="ti ti-users"></i> Mes étudiants</div>
      <div class="card-action">Voir tous <i class="ti ti-arrow-right"></i></div>
    </div>

    <div
      v-for="etudiant in safeEtudiants"
      :key="etudiant.id"
      class="student-row"
      style="cursor: pointer"
      @click="$emit('select', etudiant.id, etudiant.nom)"
    >
      <div class="avatar-sm" :style="{ background: safeGradient(etudiant.gradient) }">
        {{ safeInitiales(etudiant.initiales) }}
      </div>
      <div>
        <div class="stud-name">{{ etudiant.nom }}</div>
        <div class="stud-sub">{{ etudiant.formation }}</div>
      </div>
      <div class="stud-score" :class="safeScore(etudiant.score) >= 80 ? 'ok' : 'warn'">
        {{ safeScore(etudiant.score) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  etudiants: { type: Array, default: () => [] },
})

defineEmits(['select'])

// ── Données filtrées ──────────────────────────────────────────────────────────

/**
 * On ne rend que des objets valides avec un id numérique positif.
 */
const safeEtudiants = computed(() => {
  if (!Array.isArray(props.etudiants)) return []
  return props.etudiants.filter(e => e && typeof e === 'object' && e.id != null)
})

// ── Helpers de rendu ──────────────────────────────────────────────────────────

/**
 * Borne le score entre 0 et 100.
 */
function safeScore(score) {
  const n = Number(score)
  if (!Number.isFinite(n)) return 0
  return Math.min(100, Math.max(0, Math.round(n)))
}

/**
 * N'autorise que 1 à 3 lettres majuscules pour les initiales.
 * Empêche l'affichage de contenu arbitraire dans l'avatar.
 */
const INITIALES_RE = /^[A-ZÀ-Ÿ]{1,3}$/
function safeInitiales(val) {
  if (typeof val !== 'string') return '?'
  const upper = val.toUpperCase().trim()
  return INITIALES_RE.test(upper) ? upper : '?'
}

/**
 * N'autorise que des valeurs CSS de gradient ou de couleur connues.
 * Rejette toute valeur contenant des caractères dangereux (url(), expression()…).
 */
const UNSAFE_CSS_RE = /url\s*\(|expression\s*\(|javascript\s*:/i
function safeGradient(val) {
  if (typeof val !== 'string') return '#cccccc'
  if (UNSAFE_CSS_RE.test(val)) return '#cccccc'
  // Longueur max raisonnable pour un gradient CSS
  if (val.length > 200) return '#cccccc'
  return val
}
</script>