import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ChoiceGroup from '../ChoiceGroup.vue'

const SCALE = [1, 2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }))
const YES_NO = [
  { value: true, label: 'Sí' },
  { value: false, label: 'No' },
]

describe('ChoiceGroup', () => {
  it('renders one button per option', () => {
    const wrapper = mount(ChoiceGroup, { props: { modelValue: null, options: SCALE } })
    expect(wrapper.findAll('button')).toHaveLength(5)
  })

  it('emits update:modelValue with the clicked option value', async () => {
    const wrapper = mount(ChoiceGroup, { props: { modelValue: null, options: SCALE } })
    await wrapper.findAll('button')[2].trigger('click') // value 3

    expect(wrapper.emitted('update:modelValue')).toEqual([[3]])
  })

  it('marks the selected option as checked', () => {
    const wrapper = mount(ChoiceGroup, { props: { modelValue: 4, options: SCALE } })
    const buttons = wrapper.findAll('button')

    expect(buttons[3].attributes('aria-checked')).toBe('true')
    expect(buttons[0].attributes('aria-checked')).toBe('false')
  })

  it('distinguishes boolean option values (false is a real, selectable choice)', async () => {
    const wrapper = mount(ChoiceGroup, { props: { modelValue: null, options: YES_NO } })
    const buttons = wrapper.findAll('button')

    await buttons[1].trigger('click') // "No" -> false
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })
})
