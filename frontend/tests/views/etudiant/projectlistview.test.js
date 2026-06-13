import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ProjectListView from '@/views/Etudiant/ProjectList.vue'

vi.mock('@/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: { data: [] } }), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }))
vi.mock('@/stores/authstore', () => ({ useAuthStore: vi.fn(() => ({ user: { id_utilisateur: 'u1' }, isAuthenticated: true })) }))
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ query: {}, params: {} })),
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })),
  RouterLink: { template: '<a><slot /></a>' },
}))

describe('ProjectListView — Tests Unitaires', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('1 — se monte sans erreur', () => {
    expect(mount(ProjectListView).exists()).toBe(true)
  })

  it('2 — affiche un contenu visible', () => {
    expect(mount(ProjectListView).text().length).toBeGreaterThan(0)
  })

  it('3 — contient un élément racine div', () => {
    expect(mount(ProjectListView).find('div').exists()).toBe(true)
  })
})
