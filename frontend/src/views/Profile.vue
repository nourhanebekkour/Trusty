<script setup>
import { computed, ref } from 'vue'
import ProfileImpl from './Etudiant/Profile.vue'

const impl = ref(null)
const user = computed(() => impl.value?.user)

defineExpose({ user })
</script>

<template>
  <ProfileImpl ref="impl" />
</template>
