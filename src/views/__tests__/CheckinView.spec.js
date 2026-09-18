import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

vi.mock('../../lib/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }))
vi.mock('vue-router', () => ({ useRoute: () => ({ params: { token: 'qr-token' } }) }))

import api from '../../lib/api'
import CheckinView from '../CheckinView.vue'

const ACTIVITY = { title: 'Taller de Prueba', subject: 'Programación', host: { name: 'Ana Perez' } }

const WorkshopSurveyStub = {
  props: ['token', 'email'],
  emits: ['submitted'],
  template: '<button class="workshop-stub" @click="$emit(\'submitted\')">workshop stub</button>',
}
const EventSurveyStub = {
  props: ['email'],
  emits: ['submitted'],
  template: '<button class="event-stub" @click="$emit(\'submitted\')">event stub</button>',
}

function mountCheckinView() {
  return mount(CheckinView, {
    global: {
      stubs: { WorkshopSurveyForm: WorkshopSurveyStub, EventSurveyForm: EventSurveyStub },
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  api.get.mockResolvedValue({ data: ACTIVITY })
})

describe('CheckinView', () => {
  it('loads the activity and shows the check-in form', async () => {
    const wrapper = mountCheckinView()
    await flushPromises()

    expect(api.get).toHaveBeenCalledWith('/checkin/qr-token')
    expect(wrapper.text()).toContain('Taller de Prueba')
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('shows a friendly error when the QR token is invalid', async () => {
    api.get.mockRejectedValueOnce(new Error('not found'))
    const wrapper = mountCheckinView()
    await flushPromises()

    expect(wrapper.text()).toContain('This QR code is not valid')
  })

  it('walks through checkin -> workshop survey -> event survey -> done when the event survey is not done yet', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        attendee: { id: 1, name: 'Jose', email: 'jose@example.com' },
        checked_in_at: '2026-09-18T12:00:00Z',
        already_checked_in: false,
        event_survey_completed: false,
      },
    })

    const wrapper = mountCheckinView()
    await flushPromises()

    await wrapper.find('#name').setValue('Jose')
    await wrapper.find('#email').setValue('jose@example.com')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(api.post).toHaveBeenCalledWith('/checkin/qr-token', { name: 'Jose', email: 'jose@example.com' })
    expect(wrapper.find('.workshop-stub').exists()).toBe(true)

    await wrapper.find('.workshop-stub').trigger('click')
    await flushPromises()
    expect(wrapper.find('.event-stub').exists()).toBe(true)

    await wrapper.find('.event-stub').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('¡Gracias!')
  })

  it('skips the event survey when the attendee already completed it', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        attendee: { id: 1, name: 'Jose', email: 'jose@example.com' },
        checked_in_at: '2026-09-18T12:00:00Z',
        already_checked_in: true,
        event_survey_completed: true,
      },
    })

    const wrapper = mountCheckinView()
    await flushPromises()

    await wrapper.find('#name').setValue('Jose')
    await wrapper.find('#email').setValue('jose@example.com')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    await wrapper.find('.workshop-stub').trigger('click')
    await flushPromises()

    expect(wrapper.find('.event-stub').exists()).toBe(false)
    expect(wrapper.text()).toContain('¡Gracias!')
  })
})
