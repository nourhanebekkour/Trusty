<template>
  <div class="stats">
    <div class="stat-item fade-in" v-for="stat in stats" :key="stat.label">
      <span class="stat-num">{{ stat.value }}<span>{{ stat.suffix }}</span></span>
      <span class="stat-label">{{ stat.label }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatsVue',
  data() {
    return {
      stats: [
        { value: '25', suffix: 'k+', label: 'Étudiants Actifs' },
        { value: '150', suffix: '+', label: 'Partenaires' },
        { value: '12', suffix: 'k', label: 'Certifications' },
        { value: '94', suffix: '%', label: "Taux d'Embauche" },
      ]
    }
  },
  mounted() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible')
      })
    }, { threshold: 0.1 })
    this.$el.querySelectorAll('.fade-in').forEach(el => observer.observe(el))
  }
}
</script>

<style scoped>
.stats {
  background: var(--surface);
  padding: 60px 5rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.stat-item {
  text-align: center;
}

.stat-num {
  font-family: 'DM Serif Display', serif;
  font-size: 2.5rem;
  color: var(--dark);
  display: block;
  line-height: 1;
  margin-bottom: 6px;
}

.stat-num span {
  color: var(--mint);
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
}

@media (max-width: 900px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
    padding: 48px 2rem;
  }
}
</style>