import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IconCommunity from '@/components/icons/IconCommunity.vue'

describe('IconCommunity.vue — rendu', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(IconCommunity)
    expect(wrapper.exists()).toBe(true)
  })

  it('contient un élément SVG', () => {
    const wrapper = mount(IconCommunity)
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
