<script setup>
import { computed, ref } from 'vue'
import api from '../lib/api'
import Icon from './Icon.vue'
import ChoiceGroup from './ChoiceGroup.vue'

const props = defineProps({
  email: { type: String, required: true },
})
const emit = defineEmits(['submitted'])

const scale = [1, 2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }))
const yesNo = [
  { value: true, label: 'Sí' },
  { value: false, label: 'No' },
]
const levels = [
  { value: 'bajo', label: 'Bajo' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'alto', label: 'Alto' },
]
const enjoyedOptions = [
  { value: 'experiencia', label: 'Experiencia' },
  { value: 'convivencia', label: 'Convivencia' },
  { value: 'aprendizaje', label: 'Aprendizaje' },
]

const overallRating = ref(null)
const workshopsInformative = ref(null)
const desiredLevel = ref(null)
const wouldParticipateAgain = ref(null)
const interestedInHosting = ref(null)
const mostEnjoyed = ref(null)
const error = ref('')
const submitting = ref(false)

const canSubmit = computed(
  () =>
    overallRating.value !== null &&
    workshopsInformative.value !== null &&
    desiredLevel.value !== null &&
    wouldParticipateAgain.value !== null &&
    interestedInHosting.value !== null &&
    mostEnjoyed.value !== null
)

async function handleSubmit() {
  if (!canSubmit.value) return
  error.value = ''
  submitting.value = true
  try {
    await api.post('/event-survey', {
      email: props.email,
      overall_rating: overallRating.value,
      workshops_informative: workshopsInformative.value,
      desired_level: desiredLevel.value,
      would_participate_again: wouldParticipateAgain.value,
      interested_in_hosting: interestedInHosting.value,
      most_enjoyed: mostEnjoyed.value,
    })
    emit('submitted')
  } catch (e) {
    const errors = e.response?.data?.errors
    error.value = errors ? Object.values(errors).flat().join(' ') : 'No se pudo enviar la encuesta.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="surface-card p-8">
    <div class="text-center mb-6">
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Icon name="sparkles" class="h-6 w-6" />
      </div>
      <h1 class="text-lg font-semibold text-slate-900 mt-3">Una última cosa: el evento en general</h1>
      <p class="text-sm text-slate-500 mt-1">Esta encuesta es sobre toda la actividad, no solo este taller.</p>
    </div>

    <form class="space-y-5" @submit.prevent="handleSubmit">
      <div>
        <label class="field-label">En una escala del 1 al 5, ¿qué tan satisfecho quedaste con toda la actividad?</label>
        <ChoiceGroup v-model="overallRating" :options="scale" />
      </div>

      <div>
        <label class="field-label">En una escala del 1 al 5, ¿qué tan informativos te parecieron los talleres?</label>
        <ChoiceGroup v-model="workshopsInformative" :options="scale" />
      </div>

      <div>
        <label class="field-label">¿Qué nivel te gustaría que hubiera más en los talleres?</label>
        <ChoiceGroup v-model="desiredLevel" :options="levels" />
      </div>

      <div>
        <label class="field-label">¿Volverías a participar?</label>
        <ChoiceGroup v-model="wouldParticipateAgain" :options="yesNo" />
      </div>

      <div>
        <label class="field-label">¿Te interesaría ser tallerista?</label>
        <ChoiceGroup v-model="interestedInHosting" :options="yesNo" />
      </div>

      <div>
        <label class="field-label">¿Qué es lo que más disfrutaste de la actividad?</label>
        <ChoiceGroup v-model="mostEnjoyed" :options="enjoyedOptions" />
      </div>

      <p v-if="error" class="field-error">{{ error }}</p>

      <button type="submit" :disabled="!canSubmit || submitting" class="btn-primary w-full">
        {{ submitting ? 'Enviando…' : 'Enviar encuesta' }}
      </button>
    </form>
  </div>
</template>
