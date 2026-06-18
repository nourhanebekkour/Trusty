import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import NotificationView from '@/views/Etudiant/Notification.vue'

vi.mock('@/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: [] }), post: vi.fn(), patch: vi.fn() } }))
vi.mock('@/stores/authstore', () => ({ useAuthStore: vi.fn(() => ({ user: { id_utilisateur: 'u1' }, fetchUser: vi.fn(), isAdmin: false })) }))

describe('NotificationView — Tests Unitaires', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('1 — se monte sans erreur', () => {
    expect(mount(NotificationView).exists()).toBe(true)
  })

  it('2 — affiche un contenu visible', () => {
    expect(mount(NotificationView).text().length).toBeGreaterThan(0)
  })

  it('3 — contient un élément racine div', () => {
    expect(mount(NotificationView).find('div').exists()).toBe(true)
  })
})
