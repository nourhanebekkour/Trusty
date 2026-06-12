import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjetTableCards from '@/components/projets/ProjetTableCards.vue'

const MOCK_PROJETS = [
  {
    id_projet:         1,
    titre:             'Système de Recommandation IA',
    type_projet:       'ACADEMIQUE',
    status_validation: 'VALIDE',
    description:       'Solution ML pour recommandation.',
    date_debut:        '2024-01-01',
    date_fin:          '2024-06-30',
    date_soumission:   '2024-07-01',
    est_public:        true,
    lien_github:       'https://github.com/test/repo',
    lien_demo:         null,
    lien_youtube:      null,
    rapport:           null,
    participations:    [],
    technologies:      [],
  },
  {
    id_projet:         2,
    titre:             'Application Mobile Santé',
    type_projet:       'PERSONNEL',
    status_validation: 'EN_ATTENTE',
    description:       'App mobile de suivi de santé.',
    date_debut:        '2024-02-01',
    date_fin:          null,
    date_soumission:   '2024-08-15',
    est_public:        false,
    lien_github:       null,
    lien_demo:         null,
    lien_youtube:      null,
    rapport:           null,
    participations:    [],
    technologies:      [],
  },
]

beforeEach(() => vi.clearAllMocks())

const mountCards = (props = {}) =>
  mount(ProjetTableCards, {
    props: {
      projets:    MOCK_PROJETS,
      total:      2,
      page:       1,
      totalPages: 3,
      loading:    false,
      error:      null,
      ...props,
    },
  })

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — ProjetTableCards
// ═══════════════════════════════════════════════════════

describe('ProjetTableCards.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    expect(mountCards().exists()).toBe(true)
  })

  it('2 — affiche .loading-state "Chargement des projets..." si loading = true', () => {
    const wrapper = mountCards({ loading: true, projets: [] })
    expect(wrapper.find('.loading-state').exists()).toBe(true)
    expect(wrapper.find('.loading-state').text()).toContain('Chargement des projets...')
  })

  it('3 — n\'affiche pas .cards-grid pendant le loading', () => {
    expect(mountCards({ loading: true, projets: [] }).find('.cards-grid').exists()).toBe(false)
  })

  it('4 — affiche .error-state avec le message si error est défini', () => {
    const wrapper = mountCards({ error: 'Erreur réseau', projets: [] })
    expect(wrapper.find('.error-state').exists()).toBe(true)
    expect(wrapper.find('.error-state').text()).toContain('Erreur réseau')
  })

  it('5 — affiche .cards-grid quand loading = false et error = null', () => {
    expect(mountCards().find('.cards-grid').exists()).toBe(true)
  })

  it('6 — affiche exactement 2 cartes .projet-card avec MOCK_PROJETS', () => {
    expect(mountCards().findAll('.projet-card').length).toBe(2)
  })

  it('7 — la 1ère carte affiche le titre "Système de Recommandation IA"', () => {
    const cards = mountCards().findAll('.projet-card')
    expect(cards[0].find('.card-title').text()).toBe('Système de Recommandation IA')
  })

  it('8 — la 2ème carte affiche le titre "Application Mobile Santé"', () => {
    const cards = mountCards().findAll('.projet-card')
    expect(cards[1].find('.card-title').text()).toBe('Application Mobile Santé')
  })

  it('9 — chaque carte a un badge .badge-type', () => {
    const badges = mountCards().findAll('.badge-type')
    expect(badges.length).toBe(2)
  })

  it('10 — la pagination .pagination-bar est présente', () => {
    expect(mountCards().find('.pagination-bar').exists()).toBe(true)
  })

  it('11 — les boutons de page .page-btn sont présents (totalPages = 3 → 3 + 2 flèches)', () => {
    const btns = mountCards().findAll('.page-btn')
    expect(btns.length).toBeGreaterThanOrEqual(3)
  })

  it('12 — le bouton de la page active (page = 1) a la classe "active"', () => {
    const activeBtns = mountCards().findAll('.page-btn.active')
    expect(activeBtns.length).toBe(1)
    expect(activeBtns[0].text()).toBe('1')
  })

  it('13 — affiche .empty-card "Aucun projet trouvé." si projets = []', () => {
    const wrapper = mountCards({ projets: [], total: 0 })
    expect(wrapper.find('.empty-card').exists()).toBe(true)
    expect(wrapper.find('.empty-card').text()).toBe('Aucun projet trouvé.')
  })

  it('14 — chaque carte a un bouton d\'édition .action-btn et un de suppression .action-btn.danger', () => {
    const cards = mountCards().findAll('.projet-card')
    cards.forEach(card => {
      expect(card.find('.action-btn').exists()).toBe(true)
      expect(card.find('.action-btn.danger').exists()).toBe(true)
    })
  })

  it('15 — chaque carte a un bouton "Voir le projet" (.footer-link--voir)', () => {
    const links = mountCards().findAll('.footer-link--voir')
    expect(links.length).toBe(2)
    links.forEach(l => expect(l.text()).toContain('Voir le projet'))
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — ProjetTableCards
// ═══════════════════════════════════════════════════════

describe('ProjetTableCards.vue — Tests d\'Intégration', () => {

  it('16 — clic sur .action-btn (modifier) de la 1ère carte émet "edit" avec le projet', async () => {
    const wrapper = mountCards()
    await wrapper.findAll('.action-btn:not(.danger)')[0].trigger('click')
    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')[0][0].id_projet).toBe(1)
    expect(wrapper.emitted('edit')[0][0].titre).toBe('Système de Recommandation IA')
  })

  it('17 — clic sur .action-btn.danger (supprimer) de la 1ère carte émet "delete" avec le projet', async () => {
    const wrapper = mountCards()
    await wrapper.findAll('.action-btn.danger')[0].trigger('click')
    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')[0][0].id_projet).toBe(1)
  })

  it('18 — clic sur .action-btn.danger de la 2ème carte émet "delete" avec le 2ème projet', async () => {
    const wrapper = mountCards()
    await wrapper.findAll('.action-btn.danger')[1].trigger('click')
    expect(wrapper.emitted('delete')[0][0].id_projet).toBe(2)
  })

  it('19 — clic sur .card-body de la 1ère carte émet "view" avec le projet', async () => {
    const wrapper = mountCards()
    await wrapper.findAll('.card-body')[0].trigger('click')
    expect(wrapper.emitted('view')).toBeTruthy()
    expect(wrapper.emitted('view')[0][0].id_projet).toBe(1)
  })

  it('20 — clic sur .footer-link--voir de la 2ème carte émet "view" avec le 2ème projet', async () => {
    const wrapper = mountCards()
    await wrapper.findAll('.footer-link--voir')[1].trigger('click')
    expect(wrapper.emitted('view')).toBeTruthy()
    expect(wrapper.emitted('view')[0][0].id_projet).toBe(2)
  })

  it('21 — clic sur le bouton page 2 émet "update:page" avec la valeur 2', async () => {
    const wrapper = mountCards()
    const pageBtns = wrapper.findAll('.page-btn')
    const btn2 = pageBtns.find(b => b.text() === '2')
    await btn2.trigger('click')
    expect(wrapper.emitted('update:page')).toBeTruthy()
    expect(wrapper.emitted('update:page')[0][0]).toBe(2)
  })

  it('22 — clic sur le bouton suivant "›" émet "update:page" avec page + 1 (= 2)', async () => {
    const wrapper = mountCards()
    const pageBtns = wrapper.findAll('.page-btn')
    const nextBtn = pageBtns[pageBtns.length - 1]
    await nextBtn.trigger('click')
    expect(wrapper.emitted('update:page')?.[0][0]).toBe(2)
  })
})
