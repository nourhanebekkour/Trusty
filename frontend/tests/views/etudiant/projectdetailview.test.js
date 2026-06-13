import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('vue-router', () => ({
  useRoute:  vi.fn(),
  useRouter: vi.fn(),
}))

import { useRoute, useRouter } from 'vue-router'
import ProjectDetail           from '@/views/Etudiant/ProjectDetail.vue'

const MOCK_PROJECT = {
  id_projet:         42,
  titre:             'Système de Recommandation IA',
  type_projet:       'ACADEMIQUE',
  status_validation: 'VALIDE',
  description:       'Application ML pour recommandation personnalisée.',
  date_debut:        '2024-01-15',
  date_fin:          '2024-06-30',
}

let mockPush

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  mockPush = vi.fn()
  useRouter.mockReturnValue({ push: mockPush, replace: vi.fn() })
  useRoute.mockReturnValue({ state: null, params: { id: '42' } })
})

const mountView = (props = {}, routeState = null) => {
  useRoute.mockReturnValue({ state: routeState, params: { id: props.id ?? '42' } })
  return mount(ProjectDetail, {
    props: { id: '42', ...props },
  })
}

const mountWithProject = (projectOverrides = {}) => {
  const project = { ...MOCK_PROJECT, ...projectOverrides }
  useRoute.mockReturnValue({ state: { project }, params: { id: '42' } })
  return mount(ProjectDetail, { props: { id: '42' } })
}

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — Etudiant/ProjectDetail
// ═══════════════════════════════════════════════════════

describe('Etudiant/ProjectDetail.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur (sans projet dans route.state)', () => {
    expect(mountView().exists()).toBe(true)
  })

  it('2 — affiche "Retour aux projets" dans .back-link', () => {
    expect(mountView().find('.back-link').text()).toContain('Retour aux projets')
  })

  it('3 — affiche "Projet 42" dans .detail-panel__eyebrow avec id="42"', () => {
    expect(mountView({ id: '42' }).find('.detail-panel__eyebrow').text()).toBe('Projet 42')
  })

  it('4 — affiche "Projet 7" dans .detail-panel__eyebrow avec id="7"', () => {
    const wrapper = mount(ProjectDetail, { props: { id: '7' } })
    expect(wrapper.find('.detail-panel__eyebrow').text()).toBe('Projet 7')
  })

  it('5 — affiche le titre par défaut "Détail du projet" si pas de projet', () => {
    expect(mountView().find('.detail-panel h1').text()).toBe('Détail du projet')
  })

  it('6 — affiche la description par défaut si pas de projet', () => {
    expect(mountView().find('.detail-panel p').text()).toContain('Sélectionnez un projet')
  })

  it('7 — affiche "Non renseigné" pour Type si pas de projet', () => {
    const dds = mountView().findAll('.detail-grid dd')
    expect(dds[0].text()).toBe('Non renseigné')
  })

  it('8 — affiche "Non renseigné" pour Statut si pas de projet', () => {
    const dds = mountView().findAll('.detail-grid dd')
    expect(dds[1].text()).toBe('Non renseigné')
  })

  it('9 — affiche "Non renseignée" pour Date si pas de projet', () => {
    const dds = mountView().findAll('.detail-grid dd')
    expect(dds[2].text()).toBe('Non renseignée')
  })

  it('10 — .detail-grid contient exactement 3 blocs dt/dd', () => {
    expect(mountView().findAll('.detail-grid dt').length).toBe(3)
    expect(mountView().findAll('.detail-grid dd').length).toBe(3)
  })

  it('11 — les labels des 3 blocs sont Type, Statut, Date', () => {
    const dts = mountView().findAll('.detail-grid dt').map(dt => dt.text())
    expect(dts).toEqual(['Type', 'Statut', 'Date'])
  })

  it('12 — avec un projet, affiche son titre dans h1', () => {
    expect(mountWithProject().find('.detail-panel h1').text()).toBe('Système de Recommandation IA')
  })

  it('13 — avec un projet, affiche sa description', () => {
    expect(mountWithProject().find('.detail-panel p').text()).toContain('Application ML pour recommandation')
  })

  it('14 — avec un projet, affiche son type_projet', () => {
    const dds = mountWithProject().findAll('.detail-grid dd')
    expect(dds[0].text()).toBe('ACADEMIQUE')
  })

  it('15 — avec un projet, affiche son status_validation', () => {
    const dds = mountWithProject().findAll('.detail-grid dd')
    expect(dds[1].text()).toBe('VALIDE')
  })

  it('16 — supporte aussi les champs "type" et "statut" (non _projet / _validation)', () => {
    const wrapper = mountWithProject({ type: 'PFA', statut: 'EN_COURS', type_projet: undefined, status_validation: undefined })
    const dds = wrapper.findAll('.detail-grid dd')
    expect(dds[0].text()).toBe('PFA')
    expect(dds[1].text()).toBe('EN_COURS')
  })

  it('17 — avec date_debut, la date affichée n\'est pas "Non renseignée"', () => {
    const dds = mountWithProject().findAll('.detail-grid dd')
    expect(dds[2].text()).not.toBe('Non renseignée')
    expect(dds[2].text().length).toBeGreaterThan(3)
  })

  it('18 — supporte aussi le champ dateDebut (camelCase)', () => {
    const wrapper = mountWithProject({ dateDebut: '2024-03-01', date_debut: undefined })
    const dds = wrapper.findAll('.detail-grid dd')
    expect(dds[2].text()).not.toBe('Non renseignée')
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — Etudiant/ProjectDetail
// ═══════════════════════════════════════════════════════

describe('Etudiant/ProjectDetail.vue — Tests d\'Intégration', () => {

  it('19 — clic sur .back-link appelle router.push("/projets")', async () => {
    const wrapper = mountView()
    await wrapper.find('.back-link').trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/projets')
  })

  it('20 — clic sur .back-link n\'appelle pas push avec une autre route', async () => {
    const wrapper = mountView()
    await wrapper.find('.back-link').trigger('click')
    expect(mockPush).not.toHaveBeenCalledWith('/login')
    expect(mockPush).toHaveBeenCalledTimes(1)
  })

  it('21 — l\'id "99" passé en prop s\'affiche dans .detail-panel__eyebrow', () => {
    const wrapper = mount(ProjectDetail, { props: { id: '99' } })
    expect(wrapper.find('.detail-panel__eyebrow').text()).toBe('Projet 99')
  })

  it('22 — route.state null → fallback titre "Détail du projet"', () => {
    useRoute.mockReturnValue({ state: null })
    const wrapper = mount(ProjectDetail, { props: { id: '1' } })
    expect(wrapper.find('h1').text()).toBe('Détail du projet')
  })

  it('23 — route.state.project présent → titre du projet affiché', () => {
    useRoute.mockReturnValue({ state: { project: MOCK_PROJECT } })
    const wrapper = mount(ProjectDetail, { props: { id: '42' } })
    expect(wrapper.find('h1').text()).toBe('Système de Recommandation IA')
  })
})
