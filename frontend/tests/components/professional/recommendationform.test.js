import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RecommendationForm from '@/components/Professional/RecommendationForm.vue'

const MOCK_CANDIDAT = { id_etudiant: 42, nom: 'Alice Dupont', formation: 'GINF' }

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — RecommendationForm
// ═══════════════════════════════════════════════════════

describe('RecommendationForm.vue — Tests Unitaires', () => {

  it('1 — n\'affiche rien si candidat est null', () => {
    const wrapper = mount(RecommendationForm, { props: { candidat: null } })
    expect(wrapper.find('.rec-form-card').exists()).toBe(false)
  })

  it('2 — se monte et affiche le formulaire si candidat est fourni', () => {
    const wrapper = mount(RecommendationForm, { props: { candidat: MOCK_CANDIDAT } })
    expect(wrapper.find('.rec-form-card').exists()).toBe(true)
  })

  it('3 — affiche "Recommandation pour" dans le titre', () => {
    const wrapper = mount(RecommendationForm, { props: { candidat: MOCK_CANDIDAT } })
    expect(wrapper.text()).toContain('Recommandation pour')
  })

  it('4 — affiche le nom du candidat dans le titre', () => {
    const wrapper = mount(RecommendationForm, { props: { candidat: MOCK_CANDIDAT } })
    expect(wrapper.find('.rec-for-name').text()).toBe('Alice Dupont')
  })

  it('5 — affiche les 2 types de recommandation (Rapide / Officielle)', () => {
    const wrapper = mount(RecommendationForm, { props: { candidat: MOCK_CANDIDAT } })
    expect(wrapper.findAll('.rec-type-card').length).toBe(2)
    expect(wrapper.text()).toContain('Rapide')
    expect(wrapper.text()).toContain('Officielle')
  })

  it('6 — le type "officielle" est actif par défaut', () => {
    const wrapper = mount(RecommendationForm, { props: { candidat: MOCK_CANDIDAT } })
    expect(wrapper.findAll('.rec-type-card')[1].classes()).toContain('active')
  })

  it('7 — le bouton envoyer est désactivé si textarea vide', () => {
    const wrapper = mount(RecommendationForm, { props: { candidat: MOCK_CANDIDAT } })
    expect(wrapper.find('.btn-primary.btn-action').attributes('disabled')).toBeDefined()
  })

  it('8 — affiche le compteur "0/500" au départ', () => {
    const wrapper = mount(RecommendationForm, { props: { candidat: MOCK_CANDIDAT } })
    expect(wrapper.find('.rec-char-count').text()).toBe('0/500')
  })

  it('9 — affiche une zone de texte .rec-textarea', () => {
    const wrapper = mount(RecommendationForm, { props: { candidat: MOCK_CANDIDAT } })
    expect(wrapper.find('textarea.rec-textarea').exists()).toBe(true)
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — RecommendationForm
// ═══════════════════════════════════════════════════════

describe('RecommendationForm.vue — Tests d\'Intégration', () => {

  it('10 — clic sur Fermer (card-action) émet "fermer"', async () => {
    const wrapper = mount(RecommendationForm, { props: { candidat: MOCK_CANDIDAT } })
    await wrapper.find('.card-action').trigger('click')
    expect(wrapper.emitted('fermer')).toBeTruthy()
  })

  it('11 — clic sur Annuler (.btn-ghost) émet "fermer"', async () => {
    const wrapper = mount(RecommendationForm, { props: { candidat: MOCK_CANDIDAT } })
    await wrapper.find('.btn-ghost.btn-action').trigger('click')
    expect(wrapper.emitted('fermer')).toBeTruthy()
  })

  it('12 — saisie dans textarea active le bouton envoyer', async () => {
    const wrapper = mount(RecommendationForm, { props: { candidat: MOCK_CANDIDAT } })
    await wrapper.find('textarea.rec-textarea').setValue('Un excellent candidat pour ce poste.')
    expect(wrapper.find('.btn-primary.btn-action').attributes('disabled')).toBeUndefined()
  })

  it('13 — le compteur se met à jour en temps réel', async () => {
    const wrapper = mount(RecommendationForm, { props: { candidat: MOCK_CANDIDAT } })
    await wrapper.find('textarea.rec-textarea').setValue('Bonjour')
    expect(wrapper.find('.rec-char-count').text()).toBe('7/500')
  })

  it('14 — clic sur le type "Rapide" le rend actif', async () => {
    const wrapper = mount(RecommendationForm, { props: { candidat: MOCK_CANDIDAT } })
    await wrapper.findAll('.rec-type-card')[0].trigger('click')
    expect(wrapper.findAll('.rec-type-card')[0].classes()).toContain('active')
    expect(wrapper.findAll('.rec-type-card')[1].classes()).not.toContain('active')
  })

  it('15 — submit émet "envoyer" avec le texte et le type', async () => {
    const wrapper = mount(RecommendationForm, { props: { candidat: MOCK_CANDIDAT } })
    await wrapper.find('textarea.rec-textarea').setValue('Très bon profil, compétences solides.')
    await wrapper.find('.btn-primary.btn-action').trigger('click')
    const emitted = wrapper.emitted('envoyer')
    expect(emitted).toBeTruthy()
    expect(emitted[0][0]).toMatchObject({ texte: 'Très bon profil, compétences solides.', type: 'officielle' })
  })

  it('16 — après envoi, le textarea est réinitialisé à vide', async () => {
    const wrapper = mount(RecommendationForm, { props: { candidat: MOCK_CANDIDAT } })
    await wrapper.find('textarea.rec-textarea').setValue('Super candidat !')
    await wrapper.find('.btn-primary.btn-action').trigger('click')
    expect(wrapper.find('.rec-char-count').text()).toBe('0/500')
  })

  it('17 — n\'émet pas "envoyer" si candidat.id_etudiant est invalide', async () => {
    const candidatSansId = { nom: 'Sans ID', formation: 'X' }
    const wrapper = mount(RecommendationForm, { props: { candidat: candidatSansId } })
    await wrapper.find('textarea.rec-textarea').setValue('Texte valide suffisant')
    await wrapper.find('.btn-primary.btn-action').trigger('click')
    expect(wrapper.emitted('envoyer')).toBeFalsy()
  })
})
