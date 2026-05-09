<template>
  <main>
    <Hero />
    <Stats />
    <Features />
    <CTA />
  </main>
</template>

<script>
import Hero from '@/components/Hero.vue'
import Stats from '@/components/Stats.vue'
import Features from '@/components/Features.vue'
import CTA from '@/components/CTA.vue'

export default {
  name: 'HomeView',
  components: {
    Hero,
    Stats,
    Features,
    CTA
  }
}
</script>