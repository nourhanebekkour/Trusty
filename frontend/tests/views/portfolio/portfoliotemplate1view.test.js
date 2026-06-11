import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { RouterLinkStub } from '@vue/test-utils'
import PortfolioTemplate1 from '@/views/portfolio/PortfolioTemplate1.vue'

vi.mock('@/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: { data: {} } }) } }))

beforeEach(() => setActivePinia(createPinia()))

describe('PortfolioTemplate1.vue — rendu', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(PortfolioTemplate1, {
      global: {
        stubs: { RouterLink: RouterLinkStub },
        mocks: { $route: { params: { url_publique: 'alice-martin' } } }
      }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
