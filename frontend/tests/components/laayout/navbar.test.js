import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import NavBar from '@/components/laayout/NavBar.vue'

vi.mock('@/assets/icons/trusty.svg',        { default: 'trusty.svg' })
vi.mock('@/assets/icons/notifications.svg', { default: 'notifications.svg' })

vi.mock('@/stores/authstore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { prenom: 'Ali', nom: 'Ben', role: 'ETUDIANT', photo: null },
  })),
}))

import { useAuthStore } from '@/stores/authstore'

function mountNavBar() {
  return mount(NavBar, {
    global: { stubs: { RouterLink: true } },
  })
}

describe('NavBar.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    useAuthStore.mockReturnValue({
      user: { prenom: 'Ali', nom: 'Ben', role: 'ETUDIANT', photo: null },
    })
  })

  // ── Structure ─────────────────────────────────────────────

  it('affiche la navbar', () => {
    expect(mountNavBar().find('.navbar').exists()).toBe(true)
  })

  it('affiche le logo TRUSTY', () => {
    expect(mountNavBar().find('.logo-text').text()).toBe('TRUSTY')
  })

  it('affiche l\'icône logo', () => {
    const img = mountNavBar().find('.logo-icon')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe('Trusty')
  })

  it('affiche l\'icône notifications', () => {
    expect(mountNavBar().find('.notif-icon').exists()).toBe(true)
  })

  it('affiche le badge de notification', () => {
    expect(mountNavBar().find('.notif-badge').exists()).toBe(true)
  })

  // ── Informations utilisateur ───────────────────────────────

  it('affiche le nom complet (prenom + nom)', async () => {
    const wrapper = mountNavBar()
    await flushPromises()
    expect(wrapper.find('.user-name').text()).toBe('Ali Ben')
  })

  it('affiche le rôle de l\'utilisateur', async () => {
    const wrapper = mountNavBar()
    await flushPromises()
    expect(wrapper.find('.user-role').text()).toBe('ETUDIANT')
  })

  it('affiche les initiales quand photo est null', async () => {
    const wrapper = mountNavBar()
    await flushPromises()
    expect(wrapper.find('.user-avatar').exists()).toBe(true)
    expect(wrapper.find('.user-avatar').text()).toBe('AB')
  })

  it('affiche l\'image avatar quand photo est disponible', async () => {
    useAuthStore.mockReturnValue({
      user: { prenom: 'Ali', nom: 'Ben', role: 'ETUDIANT', photo: 'http://example.com/photo.jpg' },
    })
    const wrapper = mountNavBar()
    await flushPromises()
    const avatarImg = wrapper.find('img.user-avatar--img')
    expect(avatarImg.exists()).toBe(true)
    expect(avatarImg.attributes('src')).toBe('http://example.com/photo.jpg')
  })

  // ── Valeurs par défaut ─────────────────────────────────────

  it('affiche "YEL" pour le nom si user est null', async () => {
    useAuthStore.mockReturnValue({ user: null })
    const wrapper = mountNavBar()
    await flushPromises()
    expect(wrapper.find('.user-name').text()).toBe('YEL')
  })

  it('affiche null si role est absent', async () => {
    useAuthStore.mockReturnValue({
      user: { prenom: 'Test', nom: 'User', role: null, photo: null },
    })
    const wrapper = mountNavBar()
    await flushPromises()
    // role is null and specialite is undefined, falls back to roles.ETUDIANT mapping value
    expect(wrapper.find('.user-role').text()).toBe('Étudiant')
  })

  it('affiche PROFESSEUR comme rôle brut', async () => {
    useAuthStore.mockReturnValue({
      user: { prenom: 'Ali', nom: 'Ben', role: 'PROFESSEUR', photo: null },
    })
    const wrapper = mountNavBar()
    await flushPromises()
    expect(wrapper.find('.user-role').text()).toBe('PROFESSEUR')
  })

  it('affiche PROFESSIONNEL comme rôle brut', async () => {
    useAuthStore.mockReturnValue({
      user: { prenom: 'Ali', nom: 'Ben', role: 'PROFESSIONNEL', photo: null },
    })
    const wrapper = mountNavBar()
    await flushPromises()
    expect(wrapper.find('.user-role').text()).toBe('PROFESSIONNEL')
  })

  it('affiche ADMINISTRATEUR comme rôle brut', async () => {
    useAuthStore.mockReturnValue({
      user: { prenom: 'Ali', nom: 'Ben', role: 'ADMINISTRATEUR', photo: null },
    })
    const wrapper = mountNavBar()
    await flushPromises()
    expect(wrapper.find('.user-role').text()).toBe('ADMINISTRATEUR')
  })

  // ── Initiales ─────────────────────────────────────────────

  it('calcule les initiales à partir de prenom[0] + nom[0]', async () => {
    useAuthStore.mockReturnValue({
      user: { prenom: 'Ali', nom: 'Ben Youssef', role: 'ETUDIANT', photo: null },
    })
    const wrapper = mountNavBar()
    await flushPromises()
    // prenom[0]='A' + nom[0]='B' → 'AB'
    expect(wrapper.find('.user-avatar').text()).toBe('AB')
  })

  it('affiche une chaîne vide si prenom et nom sont absents', async () => {
    useAuthStore.mockReturnValue({
      user: { prenom: '', nom: '', role: 'ETUDIANT', photo: null },
    })
    const wrapper = mountNavBar()
    await flushPromises()
    expect(wrapper.find('.user-avatar').text()).toBe('')
  })
})
