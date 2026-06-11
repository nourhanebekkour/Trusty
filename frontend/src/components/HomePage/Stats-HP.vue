<template>
  <section class="stats-section">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="stat-item fade-in"
    >
      <div class="stat-num">{{ stat.value }}<span>{{ stat.suffix }}</span></div>
      <div class="stat-label">{{ stat.label }}</div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'StatsVue',

  data() {
    return {
      stats: [
        { value: 25, suffix: 'k+', label: 'Étudiants Actifs' },
        { value: 150, suffix: '+', label: 'Partenaires' },
        { value: 12, suffix: 'k', label: 'Certifications' },
        { value: 94, suffix: '%', label: "Taux d'Embauche" },
      ],
    }
  },

  mounted() {
    const items = this.$el.querySelectorAll('.fade-in')
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible')
      })
    })
    items.forEach(el => observer.observe(el))
  },
}
</script>
