<template>
  <header class="professor-topbar">
    <div class="professor-topbar__left">
      <div class="professor-topbar__brand">
        <div class="professor-topbar__logo">T</div>
        <span>TRUSTY</span>
      </div>

      <span class="professor-topbar__mode">
        Consultation publique
      </span>
    </div>

    <div class="professor-topbar__right">
      <button class="professor-topbar__bell" type="button" @click="goToNotifications">
        <span v-if="notificationCount > 0" class="professor-topbar__count">
          {{ notificationCount }}
        </span>
      </button>

      <div class="professor-topbar__user">
        <div class="professor-topbar__info">
          <span class="professor-topbar__name">{{ fullName }}</span>
          <span class="professor-topbar__role">Professeur</span>
        </div>

        <div class="professor-topbar__avatar">
          {{ initials }}
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authstore'

const router = useRouter()
const auth = useAuthStore()

const notificationCount = ref(3)

const fullName = computed(() => {
  if (!auth.user) {
    return 'Professeur'
  }

  const firstName = auth.user.prenom || ''
  const lastName = auth.user.nom || ''
  const name = `${firstName} ${lastName}`.trim()

  return name || 'Professeur'
})

const initials = computed(() => {
  if (!auth.user) {
    return 'P'
  }

  const firstName = auth.user.prenom?.charAt(0) || ''
  const lastName = auth.user.nom?.charAt(0) || ''

  return `${firstName}${lastName}`.toUpperCase() || 'P'
})

function goToNotifications() {
  router.push('/professor/notifications')
}

onMounted(async () => {
  if (!auth.user && typeof auth.fetchUser === 'function') {
    await auth.fetchUser()
  }
})
</script>

<style scoped>
.professor-topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #E5E0D6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  z-index: 100;
}

.professor-topbar__left,
.professor-topbar__right,
.professor-topbar__brand,
.professor-topbar__user {
  display: flex;
  align-items: center;
}

.professor-topbar__left {
  gap: 24px;
}

.professor-topbar__right {
  gap: 18px;
}

.professor-topbar__brand {
  gap: 10px;
  color: #42A8C7;
  font-weight: 800;
  letter-spacing: 0.3px;
}

.professor-topbar__logo {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #42A8C7;
  color: #ffffff;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 800;
}

.professor-topbar__mode {
  font-size: 12px;
  color: #6F7F7C;
}

.professor-topbar__bell {
  position: relative;
  width: 34px;
  height: 34px;
  border: 1px solid #E5E0D6;
  border-radius: 10px;
  background: #ffffff;
  cursor: pointer;
}

.professor-topbar__bell::before {
  content: "";
  width: 13px;
  height: 13px;
  border: 2px solid #6F7F7C;
  border-radius: 50% 50% 45% 45%;
  position: absolute;
  top: 8px;
  left: 9px;
}

.professor-topbar__bell:hover {
  background: #F4F2EC;
}

.professor-topbar__count {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 17px;
  height: 17px;
  padding: 0 5px;
  border-radius: 999px;
  background: #D94A4A;
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  display: grid;
  place-items: center;
}

.professor-topbar__user {
  gap: 10px;
}

.professor-topbar__info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.professor-topbar__name {
  font-size: 13px;
  font-weight: 700;
  color: #263534;
}

.professor-topbar__role {
  font-size: 11px;
  color: #6F7F7C;
}

.professor-topbar__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #D6EDE8;
  color: #5C8C6A;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 800;
  border: 1px solid #B9DDD5;
}
</style>