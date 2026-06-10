<template>
  <header class="professional-topbar">
    <div class="professional-topbar__left">
      <h1>Professional Space</h1>
      <p>Company supervision and internship follow-up</p>
    </div>

    <div class="professional-topbar__right">
      <div class="professional-topbar__user">
        <span class="professional-topbar__avatar">
          {{ initials }}
        </span>

        <div>
          <strong>{{ profile?.fullName || 'Professional User' }}</strong>
          <small>{{ profile?.company || 'Company supervisor' }}</small>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { professionalApi } from '@/services/professionalApi'

const profile = ref(null)

const initials = computed(() => {
  const name = profile.value?.fullName || 'Professional User'

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
})

onMounted(async () => {
  try {
    profile.value = await professionalApi.getProfile()
  } catch {
    profile.value = null
  }
})
</script>

<style scoped>
.professional-topbar {
  position: fixed;
  top: 0;
  right: 0;
  left: 260px;
  z-index: 20;
  height: 64px;
  padding: 0 32px;
  background: #ffffff;
  border-bottom: 1px solid #e7e1d6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.professional-topbar__left h1 {
  margin: 0;
  font-size: 20px;
  color: #2d2a26;
}

.professional-topbar__left p {
  margin: 2px 0 0;
  font-size: 13px;
  color: #7b7164;
}

.professional-topbar__user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.professional-topbar__avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #2f5f53;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.professional-topbar__user strong {
  display: block;
  font-size: 14px;
  color: #2d2a26;
}

.professional-topbar__user small {
  display: block;
  font-size: 12px;
  color: #7b7164;
}

@media (max-width: 900px) {
  .professional-topbar {
    left: 0;
    padding: 0 18px;
  }

  .professional-topbar__left p {
    display: none;
  }
}
</style>