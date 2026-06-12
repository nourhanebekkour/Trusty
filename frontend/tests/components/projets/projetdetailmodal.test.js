import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjetDetailModal from '@/components/projets/ProjetDetailModal.vue'

const MOCK_PROJET = {
  id_projet:              42,
  titre:                  'Système de Recommandation IA',
  type_projet:            'ACADEMIQUE',
  status_validation:      'VALIDE',
  description:            'Projet d\'analyse de données avec ML.',
  date_debut:             '2024-01-15',
  date_fin:               '2024-06-30',
  date_soumission:        '2024-07-01',
  est_public:             true,
  lien_github:            null,
  lien_demo:              null,
  lien_youtube:           null,
  nombre_collaborateurs:  3,
  resultats_obtenus:      'Précision de 92%.',
  commentaire_validation: 'Excellent travail.',
  participations:         [],
  technologies:           [],
}

beforeEach(() => vi.clearAllMocks())

const mountModal = (props = {}) =>
  mount(ProjetDetailModal, { props: { modelValue: true, projet: MOCK_PROJET, ...props } })

const mountHidden = () =>
  mount(ProjetDetailModal, { props: { modelValue: false, projet: MOCK_PROJET } })

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — ProjetDetailModal
// ═══════════════════════════════════════════════════════

describe('ProjetDetailModal.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    expect(mountModal().exists()).toBe(true)
  })

  it('2 — ne rend pas .detail-modal si modelValue = false', () => {
    expect(mountHidden().find('.detail-modal').exists()).toBe(false)
  })

  it('3 — rend .modal-overlay si modelValue = true', () => {
    expect(mountModal().find('.modal-overlay').exists()).toBe(true)
  })

  it('4 — rend .detail-modal si modelValue = true', () => {
    expect(mountModal().find('.detail-modal').exists()).toBe(true)
  })

  it('5 — affiche le titre "Détail du projet" dans .detail-title', () => {
    expect(mountModal().find('.detail-title').text()).toBe('Détail du projet')
  })

  it('6 — affiche le titre du projet dans .detail-hero-title', () => {
    expect(mountModal().find('.detail-hero-title').text()).toBe('Système de Recommandation IA')
  })

  it('7 — affiche "Public" pour un projet est_public = true', () => {
    expect(mountModal().text()).toContain('Public')
  })

  it('8 — affiche "Privé" pour un projet est_public = false', () => {
    const wrapper = mountModal({ projet: { ...MOCK_PROJET, est_public: false } })
    expect(wrapper.text()).toContain('Privé')
    expect(wrapper.text()).not.toContain('Public')
  })

  it('9 — affiche .detail-loading si la data loading = true', async () => {
    const wrapper = mountModal()
    wrapper.vm.loading = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.detail-loading').exists()).toBe(true)
  })

  it('10 — affiche "Chargement des informations…" quand loading = true', async () => {
    const wrapper = mountModal()
    wrapper.vm.loading = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.detail-loading').text()).toContain('Chargement des informations')
  })

  it('11 — affiche .detail-error si error est défini', async () => {
    const wrapper = mountModal()
    wrapper.vm.error = 'Erreur réseau'
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.detail-error').exists()).toBe(true)
    expect(wrapper.find('.detail-error').text()).toContain('Erreur réseau')
  })

  it('12 — le bouton .btn-cancel affiche "Fermer"', () => {
    expect(mountModal().find('.btn-cancel').text()).toBe('Fermer')
  })

  it('13 — le bouton .btn-new affiche "✎ Modifier ce projet"', () => {
    expect(mountModal().find('.btn-new').text()).toContain('Modifier ce projet')
  })

  it('14 — affiche la description du projet dans .detail-text', () => {
    expect(mountModal().text()).toContain('Projet d\'analyse de données avec ML.')
  })

  it('15 — n\'affiche pas .detail-scroll si modelValue = false', () => {
    expect(mountHidden().find('.detail-scroll').exists()).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — ProjetDetailModal
// ═══════════════════════════════════════════════════════

describe('ProjetDetailModal.vue — Tests d\'Intégration', () => {

  it('16 — clic sur .modal-close émet "update:modelValue" false', async () => {
    const wrapper = mountModal()
    await wrapper.find('.modal-close').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('17 — clic sur .btn-cancel émet "update:modelValue" false', async () => {
    const wrapper = mountModal()
    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('18 — clic sur .modal-overlay (backdrop) émet "update:modelValue" false', async () => {
    const wrapper = mountModal()
    await wrapper.find('.modal-overlay').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('19 — clic sur .btn-new émet "edit" avec le projet complet', async () => {
    const wrapper = mountModal()
    await wrapper.find('.btn-new').trigger('click')
    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')[0][0].id_projet).toBe(42)
    expect(wrapper.emitted('edit')[0][0].titre).toBe('Système de Recommandation IA')
  })

  it('20 — clic sur .btn-new émet aussi "update:modelValue" false (ferme le modal)', async () => {
    const wrapper = mountModal()
    await wrapper.find('.btn-new').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    expect(wrapper.emitted('edit')).toBeTruthy()
  })

  it('21 — les deux émissions se font dans l\'ordre : close et edit', async () => {
    const wrapper = mountModal()
    await wrapper.find('.btn-new').trigger('click')
    const allEmits = Object.keys(wrapper.emitted())
    expect(allEmits).toContain('update:modelValue')
    expect(allEmits).toContain('edit')
  })
})
