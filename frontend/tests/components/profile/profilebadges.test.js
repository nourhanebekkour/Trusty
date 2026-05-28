import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProfileBadges from '@/components/profile/ProfileBadges.vue'

// ─── Mock du router ────────────────────────────────────────────────────────────
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// ─── Factories ─────────────────────────────────────────────────────────────────
const makeBadge = (overrides = {}) => ({
  badge: {
    id_badge: 1,
    nom: 'Badge Test',
    icone: '🎖️',
    ...overrides.badge,
  },
  date_attribution: '2024-03-15',
  ...overrides,
})

const makeUser = (badges = []) => ({
  etudiant: { badges },
})

// ─── Suite ────────────────────────────────────────────────────────────────────
describe('ProfileBadges.vue', () => {
  let wrapper

  const mountComponent = (user = makeUser()) =>
    mount(ProfileBadges, {
      props: { user },
      global: {
        mocks: { $router: { push: mockPush } },
        stubs: { RouterLink: true },
      },
    })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Rendu de base ────────────────────────────────────────────────────────────
  describe('Rendu de base', () => {
    it('affiche le titre "Badges Certifiés"', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.section-header h3').text()).toBe('Badges Certifiés')
    })

    it('affiche le bloc de génération de portfolio', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.generate-box').exists()).toBe(true)
      expect(wrapper.find('.generate-box h4').text()).toBe('Générer mon portfolio')
    })

    it('affiche le bouton "Lancer la génération"', () => {
      wrapper = mountComponent()
      const btn = wrapper.find('.btn-primary')
      expect(btn.exists()).toBe(true)
      expect(btn.text()).toContain('Lancer la génération')
    })
  })

  // ── État vide ────────────────────────────────────────────────────────────────
  describe('État vide', () => {
    it('affiche le message "Aucun badge certifié." quand badges est vide', () => {
      wrapper = mountComponent(makeUser([]))
      expect(wrapper.find('.empty-msg').text()).toBe('Aucun badge certifié.')
    })

    it('n\'affiche pas la grille de badges quand la liste est vide', () => {
      wrapper = mountComponent(makeUser([]))
      expect(wrapper.find('.badges-grid').exists()).toBe(false)
    })

    it('affiche le message vide quand etudiant est undefined', () => {
      wrapper = mountComponent({ etudiant: undefined })
      expect(wrapper.find('.empty-msg').exists()).toBe(true)
    })

    it('affiche le message vide quand badges est undefined', () => {
      wrapper = mountComponent({ etudiant: {} })
      expect(wrapper.find('.empty-msg').exists()).toBe(true)
    })
  })

  // ── Affichage des badges ──────────────────────────────────────────────────────
  describe('Affichage des badges', () => {
    it('affiche la grille quand des badges existent', () => {
      wrapper = mountComponent(makeUser([makeBadge()]))
      expect(wrapper.find('.badges-grid').exists()).toBe(true)
      expect(wrapper.find('.empty-msg').exists()).toBe(false)
    })

    it('affiche le bon nombre de badge-card', () => {
      const badges = [makeBadge({ badge: { id_badge: 1, nom: 'A', icone: '🏅' } }), makeBadge({ badge: { id_badge: 2, nom: 'B', icone: '⭐' } })]
      wrapper = mountComponent(makeUser(badges))
      expect(wrapper.findAll('.badge-card')).toHaveLength(2)
    })

    it('affiche le nom du badge', () => {
      wrapper = mountComponent(makeUser([makeBadge({ badge: { id_badge: 1, nom: 'Expert Vue', icone: '⚡' } })]))
      expect(wrapper.find('.badge-title').text()).toBe('Expert Vue')
    })

    it('affiche l\'icône du badge', () => {
      wrapper = mountComponent(makeUser([makeBadge({ badge: { id_badge: 1, nom: 'Test', icone: '🎖️' } })]))
      expect(wrapper.find('.badge-icon span').text()).toBe('🎖️')
    })

    it('affiche l\'icône par défaut 🏅 si icone est null', () => {
      wrapper = mountComponent(makeUser([makeBadge({ badge: { id_badge: 1, nom: 'Test', icone: null } })]))
      expect(wrapper.find('.badge-icon span').text()).toBe('🏅')
    })

    it('affiche l\'année d\'attribution correcte', () => {
      wrapper = mountComponent(makeUser([makeBadge({ date_attribution: '2023-06-20' })]))
      expect(wrapper.find('.badge-year').text()).toBe('2023')
    })

    it('applique le bon background au badge-icon', () => {
      wrapper = mountComponent(makeUser([makeBadge()]))
      const icon = wrapper.find('.badge-icon')
      // Vue sérialise le style inline — on lit via element.style ou l'attribut brut
      const style = icon.attributes('style') ?? ''
      const bg = icon.element.style.background || icon.element.style.backgroundColor
      expect(style.includes('#EEEDFE') || bg.includes('EEEDFE') || bg === 'rgb(238, 237, 254)').toBe(true)
    })
  })

  // ── Navigation ────────────────────────────────────────────────────────────────
  describe('Navigation vers /portfolio', () => {
    it('appelle $router.push("/portfolio") au clic sur le bouton', async () => {
      wrapper = mountComponent()
      await wrapper.find('.btn-primary').trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/portfolio')
    })
  })

  // ── Props ─────────────────────────────────────────────────────────────────────
  describe('Props', () => {
    it('accepte la prop user de type Object', () => {
      const user = makeUser([makeBadge()])
      wrapper = mountComponent(user)
      expect(wrapper.props('user')).toEqual(user)
    })
  })
})