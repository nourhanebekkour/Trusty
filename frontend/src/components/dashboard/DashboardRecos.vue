<template>
  <section class="section section--spaced">
    <div class="section__header">
      <div class="section__title-row">
        <img src="@/assets/icons/recommandations.svg" class="icon icon--md" alt="" />
        <h2 class="section__title">Flux de Recommandations</h2>
      </div>
      <button class="btn btn--ghost" @click="$router.push('/recommendations')">Tout voir</button>
    </div>

    <div v-if="loading" class="reco-featured">
      <div class="reco-featured__bar" />
      <div class="reco-featured__body">
        <div class="skeleton skeleton--full" />
        <div class="skeleton skeleton--full" />
        <div class="skeleton skeleton--short" />
      </div>
    </div>

    <div v-else-if="recos.length === 0" class="empty-state empty-state--compact">
      <img src="@/assets/icons/recommandations.svg" class="icon icon--lg" alt="" />
      <p class="empty-state__title">Aucune recommandation pour le moment</p>
    </div>

    <template v-else>
      <div class="reco-featured">
        <div class="reco-featured__bar" />
        <div class="reco-featured__body">
          <p class="reco-featured__quote-icon">❝❝</p>
          <p class="reco-featured__text">{{ recos[0].message }}</p>
          <div class="author">
            <div class="author__avatar">
              {{ getInitials(recos[0].auteur?.prenom, recos[0].auteur?.nom) }}
            </div>
            <div class="author__info">
              <p class="author__name">
                {{ recos[0].auteur?.prenom }} {{ recos[0].auteur?.nom }}
              </p>
              <p class="author__role" v-if="getAuteurLabel(recos[0].auteur)">
                {{ getAuteurLabel(recos[0].auteur) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="recos.length > 1" class="reco-grid">
        <div
          v-for="reco in recos.slice(1, 3)"
          :key="reco.id_recommandation"
          class="reco-card"
        >
          <div class="reco-card__header">
            <div class="author">
              <div class="author__avatar author__avatar--sm">
                {{ getInitials(reco.auteur?.prenom, reco.auteur?.nom) }}
              </div>
              <div class="author__info">
                <p class="author__name">
                  {{ reco.auteur?.prenom }} {{ reco.auteur?.nom }}
                  <span v-if="getAuteurLabel(reco.auteur)" class="text-muted">
                    · {{ getAuteurLabel(reco.auteur) }}
                  </span>
                </p>
              </div>
            </div>
            <span class="reco-card__repost">Repost</span>
          </div>
          <p class="reco-card__text">{{ reco.message }}</p>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { getAuteurLabel } from '@/services/dashboardservices'

defineProps({ recos: Array, loading: Boolean })

const getInitials = (prenom = '', nom = '') =>
  ((prenom?.[0] ?? '') + (nom?.[0] ?? '')).toUpperCase()
</script>

<style scoped>
@import '@/assets/Dashboard.css';
</style>