import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfessionalView from '@/views/ProfessionalView.vue'

// ═════════════════════════════════════════════════════════════
// TESTS UNITAIRES — ProfessionalView
// ═════════════════════════════════════════════════════════════

describe('ProfessionalView — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    const wrapper = mount(ProfessionalView)
    expect(wrapper.exists()).toBe(true)
  })

  it('2 — affiche le titre "Portfolios à recommander"', () => {
    const wrapper = mount(ProfessionalView)
    expect(wrapper.text()).toContain('Portfolios à recommander')
  })

  it('3 — affiche la sidebar avec le logo Trusty', () => {
    const wrapper = mount(ProfessionalView)
    expect(wrapper.find('.logo').text()).toContain('Trusty')
  })

  it('4 — affiche 4 cartes de statistiques', () => {
    const wrapper = mount(ProfessionalView)
    expect(wrapper.findAll('.stat-card').length).toBe(4)
  })

  it('5 — affiche les tabs (Portfolios, Stages, Activités)', () => {
    const wrapper = mount(ProfessionalView)
    expect(wrapper.text()).toContain('Portfolios')
    expect(wrapper.text()).toContain('Stages')
    expect(wrapper.text()).toContain('Activités')
  })

  it('6 — affiche la liste des candidats', () => {
    const wrapper = mount(ProfessionalView)
    expect(wrapper.findAll('.proj-item').length).toBeGreaterThan(0)
  })

  it('7 — affiche le stat "En attente"', () => {
    const wrapper = mount(ProfessionalView)
    expect(wrapper.text()).toContain('En attente')
  })

  it('8 — affiche le stat "Recommandations émises"', () => {
    const wrapper = mount(ProfessionalView)
    expect(wrapper.text()).toContain('Recommandations émises')
  })

  it('9 — clic sur un candidat sélectionne ce candidat et affiche le formulaire', async () => {
    const wrapper = mount(ProfessionalView)
    const items = wrapper.findAll('.proj-item')
    await items[0].trigger('click')
    expect(wrapper.find('.rec-form-card').exists()).toBe(true)
  })

  it('10 — le bouton "Recommander" apparaît pour les candidats non recommandés', () => {
    const wrapper = mount(ProfessionalView)
    const btns = wrapper.findAll('.btn-primary.btn-sm')
    expect(btns.some(b => b.text() === 'Recommander')).toBe(true)
  })

  it('11 — le bouton submit est désactivé si recTexte est vide', async () => {
    const wrapper = mount(ProfessionalView)
    const items = wrapper.findAll('.proj-item')
    await items[0].trigger('click')
    const submitBtn = wrapper.find('.btn-action.btn-primary')
    expect(submitBtn.attributes('disabled')).toBeDefined()
  })

  it('12 — envoyerRecommandation ajoute une recommandation dans recsEmises', async () => {
    const wrapper = mount(ProfessionalView)
    await wrapper.findAll('.proj-item')[0].trigger('click')
    await wrapper.find('.rec-textarea').setValue('Excellent profil, très recommandé pour ce poste.')
    await wrapper.find('.btn-action.btn-primary').trigger('click')
    expect(wrapper.text()).toContain('Recommandations émises')
  })
})

// ═════════════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — ProfessionalView
// ═════════════════════════════════════════════════════════════

describe("ProfessionalView — Tests d'Intégration", () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('13 — clic sur "Recommander" ouvre le formulaire pour ce candidat', async () => {
    const wrapper = mount(ProfessionalView)
    const btn = wrapper.findAll('.btn-primary.btn-sm').find(b => b.text() === 'Recommander')
    await btn.trigger('click')
    expect(wrapper.find('.rec-form-card').exists()).toBe(true)
  })

  it('14 — après envoi, le formulaire se ferme', async () => {
    const wrapper = mount(ProfessionalView)
    await wrapper.findAll('.proj-item')[0].trigger('click')
    await wrapper.find('.rec-textarea').setValue('Super profil, je recommande vivement.')
    await wrapper.find('.btn-action.btn-primary').trigger('click')
    expect(wrapper.find('.rec-form-card').exists()).toBe(false)
  })

  it('15 — onglet actif par défaut est "Portfolios"', () => {
    const wrapper = mount(ProfessionalView)
    const activeTab = wrapper.find('.tab.active')
    expect(activeTab.text()).toBe('Portfolios')
  })

  it('16 — clic sur un autre onglet le rend actif', async () => {
    const wrapper = mount(ProfessionalView)
    const tabs = wrapper.findAll('.tab')
    await tabs[1].trigger('click')
    expect(tabs[1].classes()).toContain('active')
  })
})
