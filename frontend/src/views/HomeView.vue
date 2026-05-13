<template>
   <Navbar />
    <main>
      <Hero />
      <Stats />
      <Features />
      <CTA />
    </main>
  <Footer />
</template>

<script>
import Hero from '@/components/Hero.vue'
import Stats from '@/components/Stats.vue'
import Features from '@/components/Features.vue'
import CTA from '@/components/CTA.vue'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'

export default {
  name: 'HomeView',
  components: {
    Hero,
    Stats,
    Features,
    CTA,
    Navbar,
    Footer
  }
}
</script>