<template>
  <section class="features">
    <div class="section-header">
      <div class="section-label">Fonctionnalités</div>
      <h2 class="section-title">Une plateforme conçue pour<br>l'excellence académique</h2>
      <p class="section-desc">Nous comblons le fossé entre les études et le monde professionnel en apportant une couche de confiance technologique.</p>
    </div>

    <div class="features-grid">
      <div
        v-for="(feature, index) in features"
        :key="feature.name"
        class="feature-card fade-in"
        :class="{ conf: feature.conf }"
      >
        <div class="feature-icon" v-html="feature.icon"></div>
        <div class="feature-name">{{ feature.name }}</div>
        <p class="feature-desc">{{ feature.desc }}</p>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'FeaturesVue',
  data() {
    return {
      features: [
        {
          name: 'Validation Institutionnelle',
          desc: 'Vos projets, stages et diplômes sont vérifiés directement par vos professeurs et les entreprises partenaires.',
          conf: false,
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>`
        },
        {
          name: 'Score de Crédibilité',
          desc: 'Plus vous accumulez de recommandations et de validations, plus votre indice de confiance augmente sur le marché.',
          conf: true,
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
          </svg>`
        },
        {
          name: 'Visibilité Mondiale',
          desc: 'Exportez votre portfolio certifié sous format numérique infalsifiable, accessible partout dans le monde.',
          conf: false,
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>`
        },
        {
          name: 'Badges Compétences',
          desc: 'Débloquez des badges officiels basés sur vos réalisations concrètes et validés par des experts du domaine.',
          conf: true,
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
          </svg>`
        },
        {
          name: 'Recrutement Simplifié',
          desc: 'Les recruteurs accèdent à des données certifiées, réduisant le temps de sourcing et de vérification des CV.',
          conf: false,
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          </svg>`
        },
        {
          name: 'Sécurité & Confidentialité',
          desc: 'Contrôlez qui voit quoi. Votre portfolio est protégé par des protocoles de sécurité de niveau bancaire.',
          conf: false,
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>`
        }
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
.features {
  padding: 100px 5rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.feature-card {
  background: var(--surface);
  border-radius: 16px;
  padding: 32px;
  border: 1px solid var(--border);
  transition: all 0.25s;
  cursor: default;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(214, 237, 232, 0.06), transparent);
  opacity: 0;
  transition: opacity 0.25s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(214, 237, 232, 0.25);
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-card.conf {
  background: var(--surface);
  border-color: rgba(214, 237, 232, 0.18);
}

.feature-icon {
  width: 48px;
  height: 48px;
  background: var(--bg);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  border: 1px solid var(--border);
}

.feature-card.conf .feature-icon {
  background: var(--bg);
}

.feature-icon :deep(svg) {
  width: 24px;
  height: 24px;
  color: var(--mint);
}

.feature-name {
  font-weight: 600;
  font-size: 1rem;
  color: var(--dark);
  margin-bottom: 10px;
}

.feature-desc {
  font-size: 0.88rem;
  color: var(--muted);
  line-height: 1.65;
}

@media (max-width: 900px) {
  .features {
    padding: 60px 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>