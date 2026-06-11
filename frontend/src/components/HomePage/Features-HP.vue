<template>
  <section class="features-section">
    <div class="features-grid">
      <div v-for="feat in features" :key="feat.title" class="feature-card">
        <div class="feat-icon">{{ feat.icon }}</div>
        <h3>{{ feat.title }}</h3>
        <p>{{ feat.desc }}</p>
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
        { icon: '◈', title: 'Validation Institutionnelle', desc: 'Vos projets sont vérifiés directement par vos professeurs.' },
        { icon: '⬡', title: 'Score de Crédibilité', desc: 'Accumulez des recommandations et augmentez votre indice de confiance.' },
        { icon: '◎', title: 'Visibilité Mondiale', desc: 'Exportez votre portfolio certifié sous format numérique vérifiable.' },
        { icon: '◇', title: 'Badges Compétences', desc: 'Débloquez des badges officiels basés sur vos réalisations.' },
        { icon: '▣', title: 'Recrutement Simplifié', desc: 'Les recruteurs accèdent à des données certifiées.' },
        { icon: '⊕', title: 'Sécurité & Confidentialité', desc: 'Contrôlez qui voit quoi avec des protocoles de sécurité avancés.' },
      ],
    }
  },
}
</script>
