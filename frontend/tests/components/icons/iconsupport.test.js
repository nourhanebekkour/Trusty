import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IconSupport from '@/components/icons/IconSupport.vue'

describe('IconSupport.vue — rendu', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(IconSupport)
    expect(wrapper.exists()).toBe(true)
  })

  it('contient un élément SVG', () => {
    const wrapper = mount(IconSupport)
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
