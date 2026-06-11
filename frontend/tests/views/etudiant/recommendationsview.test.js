import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import RecommendationsView from '@/views/Etudiant/Recommendations.vue'

vi.mock('@/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: { data: [] } }), post: vi.fn() } }))
vi.mock('@/stores/authstore', () => ({ useAuthStore: vi.fn(() => ({ user: { id_utilisateur: 'u1', role: 'ETUDIANT' }, fetchUser: vi.fn(), isAdmin: false })) }))

describe('RecommendationsView — Tests Unitaires', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('1 — se monte sans erreur', () => {
    expect(mount(RecommendationsView).exists()).toBe(true)
  })

  it('2 — affiche un contenu visible', () => {
    expect(mount(RecommendationsView).text().length).toBeGreaterThan(0)
  })

  it('3 — contient un élément racine div', () => {
    expect(mount(RecommendationsView).find('div').exists()).toBe(true)
  })
})
