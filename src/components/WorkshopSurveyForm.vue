<script setup>
import { computed, ref } from 'vue'
import api from '../lib/api'
import Icon from './Icon.vue'
import ChoiceGroup from './ChoiceGroup.vue'

const props = defineProps({
  token: { type: String, required: true },
  email: { type: String, required: true },
})
const emit = defineEmits(['submitted'])

const scale = [1, 2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }))
const yesNo = [
  { value: true, label: 'Sí' },
  { value: false, label: 'No' },
]

const enjoyment = ref(null)
const learning = ref(null)
const applicability = ref(null)
const secondPartWanted = ref(null)
const instructorCompetence = ref(null)
const workshopSuggestion = ref('')
const instructorSuggestion = ref('')
const error = ref('')
const submitting = ref(false)

const canSubmit = computed(
  () =>
    enjoyment.value !== null &&
    learning.value !== null &&
    applicability.value !== null &&
    secondPartWanted.value !== null &&
    instructorCompetence.value !== null
)

async function handleSubmit() {
  if (!canSubmit.value) return
  error.value = ''
  submitting.value = true
  try {
    await api.post(`/checkin/${props.token}/survey`, {
      email: props.email,
      enjoyment: enjoyment.value,
      learning: learning.value,
      applicability: applicability.value,
      second_part_wanted: secondPartWanted.value,
      instructor_competence: instructorCompetence.value,
      workshop_suggestion: workshopSuggestion.value || null,
      instructor_suggestion: instructorSuggestion.value || null,
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
      <h1 class="text-lg font-semibold text-slate-900 mt-3">Cuéntanos sobre el taller</h1>
      <p class="text-sm text-slate-500 mt-1">Tu opinión nos ayuda a mejorar.</p>
    </div>

    <form class="space-y-5" @submit.prevent="handleSubmit">
      <div>
        <label class="field-label">En una escala del 1 al 5, ¿qué tanto disfrutaste del taller?</label>
        <ChoiceGroup v-model="enjoyment" :options="scale" />
      </div>

      <div>
        <label class="field-label">En una escala del 1 al 5, ¿qué tanto aprendiste en este taller?</label>
        <ChoiceGroup v-model="learning" :options="scale" />
      </div>

      <div>
        <label class="field-label">En una escala del 1 al 5, ¿qué tan aplicable es lo visto en el taller?</label>
        <ChoiceGroup v-model="applicability" :options="scale" />
      </div>

      <div>
        <label class="field-label">¿Te gustaría que este taller tuviera una segunda parte?</label>
        <ChoiceGroup v-model="secondPartWanted" :options="yesNo" />
      </div>

      <div>
        <label class="field-label">En una escala del 1 al 5, ¿el tallerista fue competente para el tema?</label>
        <ChoiceGroup v-model="instructorCompetence" :options="scale" />
      </div>

      <div>
        <label class="field-label" for="workshop_suggestion">
          ¿Qué sugerencia le darías al taller? <span class="text-slate-400 font-normal">(opcional)</span>
        </label>
        <textarea
          id="workshop_suggestion"
          v-model="workshopSuggestion"
          rows="2"
          class="field-input resize-none"
        ></textarea>
      </div>

      <div>
        <label class="field-label" for="instructor_suggestion">
          ¿Qué sugerencia le darías al tallerista? <span class="text-slate-400 font-normal">(opcional)</span>
        </label>
        <textarea
          id="instructor_suggestion"
          v-model="instructorSuggestion"
          rows="2"
          class="field-input resize-none"
        ></textarea>
      </div>

      <p v-if="error" class="field-error">{{ error }}</p>

      <button type="submit" :disabled="!canSubmit || submitting" class="btn-primary w-full">
        {{ submitting ? 'Enviando…' : 'Enviar encuesta' }}
      </button>
    </form>
  </div>
</template>
