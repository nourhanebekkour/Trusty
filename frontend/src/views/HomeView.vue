<template>
  <div class="home">
    <NavbarHP />
    <main>
      <HeroHP />
      <StatsHP />
      <FeaturesHP />
      <CTAHP />
    </main>
    <FooterHP />
  </div>
</template>

<script>
import NavbarHP   from '@/components/HomePage/Navbar-HP.vue'
import HeroHP     from '@/components/HomePage/Hero-HP.vue'
import StatsHP    from '@/components/HomePage/Stats-HP.vue'
import FeaturesHP from '@/components/HomePage/Features-HP.vue'
import CTAHP      from '@/components/HomePage/CTA-HP.vue'
import FooterHP   from '@/components/HomePage/Footer-HP.vue'

export default {
  name: 'HomeView',
  components: { NavbarHP, HeroHP, StatsHP, FeaturesHP, CTAHP, FooterHP },
}
</script>
