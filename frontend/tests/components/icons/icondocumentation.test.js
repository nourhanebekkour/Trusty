import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IconDocumentation from '@/components/icons/IconDocumentation.vue'

describe('IconDocumentation.vue — rendu', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(IconDocumentation)
    expect(wrapper.exists()).toBe(true)
  })

  it('contient un élément SVG', () => {
    const wrapper = mount(IconDocumentation)
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
