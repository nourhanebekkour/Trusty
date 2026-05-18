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
import Hero from '@/components/HomePage/Hero-HP.vue'
import Stats from '@/components/HomePage/Stats-HP.vue'
import Features from '@/components/HomePage/Features-HP.vue'
import CTA from '@/components/HomePage/CTA-HP.vue'
import Navbar from '@/components/HomePage/Navbar-HP.vue'
import Footer from '@/components/HomePage/Footer-HP.vue'

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