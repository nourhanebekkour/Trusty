import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Hero from '@/components/HomePage/Hero-HP.vue'

describe('Hero-HP.vue', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(Hero)
    expect(wrapper.exists()).toBe(true)
  })

  it('affiche le badge de certification', () => {
    const wrapper = mount(Hero)
    expect(wrapper.find('.hero-badge').exists()).toBe(true)
    expect(wrapper.text()).toContain('Plateforme certifiée')
  })

  it('affiche le titre principal h1', () => {
    const wrapper = mount(Hero)
    const h1 = wrapper.find('h1')
    expect(h1.exists()).toBe(true)
    expect(h1.text()).toContain('Portfolios Numériques')
  })

  it('affiche le mot-clé accent "Adaptatifs"', () => {
    const wrapper = mount(Hero)
    const accent = wrapper.find('.accent')
    expect(accent.exists()).toBe(true)
    expect(accent.text()).toContain('Adaptatifs')
  })

  it('affiche le sous-titre de description', () => {
    const wrapper = mount(Hero)
    const sub = wrapper.find('.hero-sub')
    expect(sub.exists()).toBe(true)
    expect(sub.text()).toContain('parcours académique')
  })

  it('affiche les deux items de la checklist', () => {
    const wrapper = mount(Hero)
    const items = wrapper.findAll('.hero-checklist li')
    expect(items).toHaveLength(2)
    expect(items[0].text()).toContain('validations institutionnelles')
    expect(items[1].text()).toContain('score de crédibilité')
  })

  it('affiche le bouton principal "Mon Portfolio"', () => {
    const wrapper = mount(Hero)
    const btn = wrapper.find('.btn-primary-lg')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toBe('Mon Portfolio')
  })

  it('affiche la carte de certification dans le visuel', () => {
    const wrapper = mount(Hero)
    expect(wrapper.find('.cert-card').exists()).toBe(true)
  })

  it('affiche le titre de la carte "Certificat de Validation"', () => {
    const wrapper = mount(Hero)
    expect(wrapper.find('.cert-title').text()).toContain('Certificat de Validation')
  })

  it('affiche les avatars des experts', () => {
    const wrapper = mount(Hero)
    const avatars = wrapper.findAll('.expert-avatar')
    expect(avatars).toHaveLength(3)
  })

  it('affiche le tag "Validé par 12 experts"', () => {
    const wrapper = mount(Hero)
    expect(wrapper.find('.validated-tag').text()).toContain('Validé par 12 experts')
  })

  it('affiche le shield dans le cert-body', () => {
    const wrapper = mount(Hero)
    expect(wrapper.find('.shield-large').exists()).toBe(true)
  })

  it('affiche le badge animé (dot)', () => {
    const wrapper = mount(Hero)
    expect(wrapper.find('.dot').exists()).toBe(true)
  })

  it('possède le bon nom de composant', () => {
    expect(Hero.name).toBe('HeroVue')
  })
})