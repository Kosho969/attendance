import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

vi.mock('../../lib/api', () => ({ default: { post: vi.fn() } }))

import api from '../../lib/api'
import WorkshopSurveyForm from '../WorkshopSurveyForm.vue'
import ChoiceGroup from '../ChoiceGroup.vue'

beforeEach(() => {
  vi.clearAllMocks()
})

// ChoiceGroup order in the template: enjoyment, learning, applicability, secondPartWanted, instructorCompetence
async function fillRequiredFields(wrapper) {
  const groups = wrapper.findAllComponents(ChoiceGroup)
  await groups[0].vm.$emit('update:modelValue', 5)
  await groups[1].vm.$emit('update:modelValue', 4)
  await groups[2].vm.$emit('update:modelValue', 5)
  await groups[3].vm.$emit('update:modelValue', true)
  await groups[4].vm.$emit('update:modelValue', 5)
}

describe('WorkshopSurveyForm', () => {
  it('disables submit until every required rating is answered', async () => {
    const wrapper = mount(WorkshopSurveyForm, { props: { token: 'qr-token', email: 'jose@example.com' } })
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()

    await fillRequiredFields(wrapper)
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined()
  })

  it('submits the collected answers with optional fields defaulting to null, and emits submitted', async () => {
    api.post.mockResolvedValueOnce({ data: { id: 1 } })
    const wrapper = mount(WorkshopSurveyForm, { props: { token: 'qr-token', email: 'jose@example.com' } })
    await fillRequiredFields(wrapper)

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(api.post).toHaveBeenCalledWith('/checkin/qr-token/survey', {
      email: 'jose@example.com',
      enjoyment: 5,
      learning: 4,
      applicability: 5,
      second_part_wanted: true,
      instructor_competence: 5,
      workshop_suggestion: null,
      instructor_suggestion: null,
    })
    expect(wrapper.emitted('submitted')).toBeTruthy()
  })

  it('shows a combined error message when the API rejects with validation errors', async () => {
    api.post.mockRejectedValueOnce({ response: { data: { errors: { enjoyment: ['Must be between 1 and 5.'] } } } })
    const wrapper = mount(WorkshopSurveyForm, { props: { token: 'qr-token', email: 'jose@example.com' } })
    await fillRequiredFields(wrapper)

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('Must be between 1 and 5.')
    expect(wrapper.emitted('submitted')).toBeFalsy()
  })
})
