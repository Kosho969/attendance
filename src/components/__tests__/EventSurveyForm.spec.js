import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

vi.mock('../../lib/api', () => ({ default: { post: vi.fn() } }))

import api from '../../lib/api'
import EventSurveyForm from '../EventSurveyForm.vue'
import ChoiceGroup from '../ChoiceGroup.vue'

beforeEach(() => {
  vi.clearAllMocks()
})

// ChoiceGroup order: overallRating, workshopsInformative, desiredLevel, wouldParticipateAgain,
// interestedInHosting, mostEnjoyed
async function fillRequiredFields(wrapper) {
  const groups = wrapper.findAllComponents(ChoiceGroup)
  await groups[0].vm.$emit('update:modelValue', 5)
  await groups[1].vm.$emit('update:modelValue', 4)
  await groups[2].vm.$emit('update:modelValue', 'intermedio')
  await groups[3].vm.$emit('update:modelValue', true)
  await groups[4].vm.$emit('update:modelValue', true)
  await groups[5].vm.$emit('update:modelValue', 'convivencia')
}

describe('EventSurveyForm', () => {
  it('disables submit until every question is answered', async () => {
    const wrapper = mount(EventSurveyForm, { props: { email: 'jose@example.com' } })
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()

    await fillRequiredFields(wrapper)
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined()
  })

  it('submits the collected answers and emits submitted', async () => {
    api.post.mockResolvedValueOnce({ data: { id: 1 } })
    const wrapper = mount(EventSurveyForm, { props: { email: 'jose@example.com' } })
    await fillRequiredFields(wrapper)

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(api.post).toHaveBeenCalledWith('/event-survey', {
      email: 'jose@example.com',
      overall_rating: 5,
      workshops_informative: 4,
      desired_level: 'intermedio',
      would_participate_again: true,
      interested_in_hosting: true,
      most_enjoyed: 'convivencia',
    })
    expect(wrapper.emitted('submitted')).toBeTruthy()
  })
})
