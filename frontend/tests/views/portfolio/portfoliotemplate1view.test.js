import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import PortfolioTemplate1 from '@/views/portfolio/PortfolioTemplate1.vue'

vi.mock('@/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: { data: {} } }) } }))

beforeEach(() => setActivePinia(createPinia()))

describe('PortfolioTemplate1.vue — rendu', () => {
  it('se monte sans erreur', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/portfolio/:url_publique', component: PortfolioTemplate1 }],
    })
    await router.push('/portfolio/alice-martin')
    await router.isReady()

    const wrapper = mount(PortfolioTemplate1, {
      global: { plugins: [router] },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
