<template>
  <span class="badge" :class="badgeClass">{{ label }}</span>
</template>

<script setup>
const props = defineProps({
  status: { type: String, required: true }
})

const statusMap = {
  'Certifié':    { class: 'badge--success',  label: 'Certifié' },
  'Validé':      { class: 'badge--success',  label: 'Validé' },
  'Actif':       { class: 'badge--success',  label: 'Actif' },
  'En attente':  { class: 'badge--warning',  label: 'En attente' },
  'En cours':    { class: 'badge--info',     label: 'En cours' },
  'Brouillon':   { class: 'badge--neutral',  label: 'Brouillon' },
  'Refusé':      { class: 'badge--danger',   label: 'Refusé' },
  'Rejeté':      { class: 'badge--danger',   label: 'Rejeté' },
  'Professeur':  { class: 'badge--blue',     label: 'Professeur' },
  'Étudiant':    { class: 'badge--neutral',  label: 'Étudiant' },
  'Professionnel':{ class: 'badge--purple',  label: 'Professionnel' },
}

const badgeClass = statusMap[props.status]?.class || 'badge--neutral'
const label = statusMap[props.status]?.label || props.status
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.badge--success  { background: #dcfce7; color: #16a34a; }
.badge--warning  { background: #fef9c3; color: #ca8a04; }
.badge--info     { background: #eff6ff; color: #2563eb; }
.badge--neutral  { background: #162e2e; color: #8aada9; }
.badge--danger   { background: #fee2e2; color: #dc2626; }
.badge--blue     { background: #dbeafe; color: #1d4ed8; }
.badge--purple   { background: #f3e8ff; color: #7c3aed; }
</style>