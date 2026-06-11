import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { RouterLinkStub } from '@vue/test-utils'
import VerifyEmailView from '@/views/VerifyEmailView.vue'

vi.mock('@/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: { success: true } }), post: vi.fn() } }))

beforeEach(() => setActivePinia(createPinia()))

describe('VerifyEmailView.vue — rendu', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(VerifyEmailView, {
      global: {
        stubs: { RouterLink: RouterLinkStub },
        mocks: { $route: { query: { token: 'abc123' } } }
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('affiche un contenu lié à la vérification email', () => {
    const wrapper = mount(VerifyEmailView, {
      global: {
        stubs: { RouterLink: RouterLinkStub },
        mocks: { $route: { query: { token: 'abc123' } } }
      }
    })
    expect(wrapper.text().toLowerCase()).toMatch(/email|vérif|confirm|activat/)
  })
})
