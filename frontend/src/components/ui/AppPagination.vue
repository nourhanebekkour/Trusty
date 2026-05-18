<template>
  <div class="pagination">
    <span class="pagination__info">
      Affichage de {{ from }}-{{ to }} sur {{ totalItems }} {{ itemLabel }}
    </span>
    <div class="pagination__controls">
      <button :disabled="currentPage === 1" @click="$emit('page-change', currentPage - 1)">
        Précédent
      </button>
      <template v-for="p in visiblePages" :key="p">
        <span v-if="p === '...'" class="pagination__dots">…</span>
        <button
          v-else
          :class="{ active: p === currentPage }"
          @click="$emit('page-change', p)"
        >{{ p }}</button>
      </template>
      <button :disabled="currentPage === totalPages" @click="$emit('page-change', currentPage + 1)">
        Suivant
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, default: 1 },
  totalPages:  { type: Number, required: true },
  totalItems:  { type: Number, required: true },
  perPage:     { type: Number, default: 5 },
  itemLabel:   { type: String, default: 'éléments' }
})
defineEmits(['page-change'])

const from = computed(() => (props.currentPage - 1) * props.perPage + 1)
const to   = computed(() => Math.min(props.currentPage * props.perPage, props.totalItems))

const visiblePages = computed(() => {
  const pages = []
  if (props.totalPages <= 5) {
    for (let i = 1; i <= props.totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (props.currentPage > 3) pages.push('...')
    for (let i = Math.max(2, props.currentPage - 1); i <= Math.min(props.totalPages - 1, props.currentPage + 1); i++) {
      pages.push(i)
    }
    if (props.currentPage < props.totalPages - 2) pages.push('...')
    pages.push(props.totalPages)
  }
  return pages
})
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 13px;
  color: #8aada9;
}
.pagination__controls {
  display: flex;
  align-items: center;
  gap: 4px;
}
.pagination__controls button {
  padding: 6px 12px;
  border: 1px solid #2a4a48;
  border-radius: 6px;
  background: #1A3838;
  font-size: 13px;
  cursor: pointer;
  color: #c8deda;
  transition: all 0.15s;
}
.pagination__controls button:hover:not(:disabled) {
  background: #162e2e;
}
.pagination__controls button.active {
  background: #5C8C6A;
  color: #fff;
  border-color: #5C8C6A;
}
.pagination__controls button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pagination__dots {
  padding: 0 4px;
  color: #4a6e6a;
}
</style>