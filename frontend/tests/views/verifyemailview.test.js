import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { RouterLinkStub } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import VerifyEmailView from '@/views/VerifyEmailView.vue'

vi.mock('@/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: { success: true } }), post: vi.fn().mockResolvedValue({}) } }))
vi.mock('@/services/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: {} }), post: vi.fn().mockResolvedValue({}) } }))

beforeEach(() => setActivePinia(createPinia()))

async function mountView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: VerifyEmailView }],
  })
  await router.push('/?token=abc123')
  await router.isReady()
  return mount(VerifyEmailView, {
    global: { plugins: [router], stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('VerifyEmailView.vue — rendu', () => {
  it('se monte sans erreur', async () => {
    const wrapper = await mountView()
    expect(wrapper.exists()).toBe(true)
  })

  it('affiche un contenu lié à la vérification email', async () => {
    const wrapper = await mountView()
    expect(wrapper.text().toLowerCase()).toMatch(/email|vérif|confirm|activat/)
  })
})
