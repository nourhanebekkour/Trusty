<template>
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="ti ti-bell"></i> Activité récente</div>
    </div>
    <div
      v-for="notif in sanitizedNotifications"
      :key="notif.id"
      class="notif-item"
      :class="{ 'no-border': notif.last }"
      style="cursor: pointer"
      @click="handleClick(notif.id)"
    >
      <span class="notif-dot" :style="{ background: safeColor(notif.color) }"></span>
      <div>
        <div class="notif-text"><strong>{{ notif.nom }}</strong> {{ notif.message }}</div>
        <div class="notif-time">{{ notif.time }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useProfessorStore } from '@/stores/professorStore'

const props = defineProps({
  notifications: { type: Array, default: () => [] },
})

const store = useProfessorStore()

// XSS : encodage des chaînes venant des props
const sanitizeText = (value) => {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

// CSS injection : seules les couleurs hex, rgb(), rgba(), hsl() et nommées sont acceptées
const SAFE_COLOR_RE = /^(#[0-9a-fA-F]{3,8}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)|hsl\(\s*\d+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*\)|[a-zA-Z]{2,30})$/

const safeColor = (color) => {
  if (!color || typeof color !== 'string') return '#cccccc'
  return SAFE_COLOR_RE.test(color.trim()) ? color.trim() : '#cccccc'
}

// Validation de l'id avant de le passer au store
const isValidId = (id) => {
  if (id === null || id === undefined) return false
  const n = Number(id)
  if (Number.isInteger(n) && n > 0) return true
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id))) return true
  return false
}

// Rate limiting : max 30 clics / 60s (protège marquerLue contre le spam)
const CLICK_LIMIT     = 30
const CLICK_WINDOW_MS = 60_000
const clickTimestamps = ref([])

const isClickLimited = () => {
  const now = Date.now()
  clickTimestamps.value = clickTimestamps.value.filter(ts => now - ts < CLICK_WINDOW_MS)
  return clickTimestamps.value.length >= CLICK_LIMIT
}

const recordClick = () => {
  clickTimestamps.value.push(Date.now())
}

const handleClick = (id) => {
  if (!isValidId(id) || isClickLimited()) return
  recordClick()
  store.marquerLue(id)
}

// Sanitisation de chaque notification reçue via props
const sanitizedNotifications = computed(() =>
  props.notifications
    .filter(n => n && typeof n === 'object')
    .map(n => ({
      ...n,
      nom:     sanitizeText(n.nom),
      message: sanitizeText(n.message),
      time:    sanitizeText(n.time),
    }))
)
</script>