<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '../lib/api'
import Icon from '../components/Icon.vue'

const route = useRoute()

const activity = ref(null)
const loadError = ref('')
const loading = ref(true)

const name = ref('')
const email = ref('')
const submitting = ref(false)
const submitError = ref('')
const result = ref(null)

async function loadActivity() {
  loading.value = true
  loadError.value = ''
  try {
    const { data } = await api.get(`/checkin/${route.params.token}`)
    activity.value = data
  } catch (e) {
    loadError.value = 'This QR code is not valid or the activity no longer exists.'
  } finally {
    loading.value = false
  }
}

onMounted(loadActivity)

async function handleSubmit() {
  submitError.value = ''
  submitting.value = true
  try {
    const { data } = await api.post(`/checkin/${route.params.token}`, {
      name: name.value,
      email: email.value,
    })
    result.value = data
  } catch (e) {
    const errors = e.response?.data?.errors
    submitError.value = errors ? Object.values(errors).flat().join(' ') : 'Could not check in.'
  } finally {
    submitting.value = false
  }
}

function formatTime(value) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
</script>

<template>
  <main class="min-h-[calc(100vh-4.25rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-brand-50/60 to-slate-50">
    <div class="w-full max-w-sm">
      <div v-if="loading" class="surface-card p-8 animate-pulse">
        <div class="h-4 w-2/3 bg-slate-200 rounded mx-auto"></div>
        <div class="h-3 w-1/2 bg-slate-100 rounded mx-auto mt-3"></div>
      </div>

      <div v-else-if="loadError" class="surface-card p-8 text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
          <Icon name="x-circle" class="h-7 w-7" />
        </div>
        <p class="text-sm text-slate-600 mt-4">{{ loadError }}</p>
      </div>

      <div v-else-if="result" class="surface-card p-8 text-center">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Icon name="check-circle" class="h-8 w-8" />
        </div>
        <h1 class="text-lg font-semibold text-slate-900 mt-4">
          {{ result.already_checked_in ? 'Already checked in' : "You're checked in!" }}
        </h1>
        <p class="text-sm text-slate-600 mt-1">{{ activity.title }}</p>
        <p class="text-sm text-slate-400 mt-1">{{ formatTime(result.checked_in_at) }}</p>
      </div>

      <template v-else-if="activity">
        <div class="flex justify-center mb-6">
          <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md">
            <Icon name="qr-code" class="h-7 w-7" />
          </span>
        </div>

        <div class="surface-card p-8">
          <div class="text-center mb-6">
            <h1 class="text-lg font-semibold text-slate-900">{{ activity.title }}</h1>
            <span class="badge-brand mt-2">{{ activity.subject }}</span>
            <p class="text-sm text-slate-500 mt-2">Hosted by {{ activity.host?.name }}</p>
          </div>

          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div>
              <label class="field-label" for="name">Name</label>
              <input id="name" v-model="name" type="text" required class="field-input" placeholder="Jane Doe" />
            </div>

            <div>
              <label class="field-label" for="email">Email</label>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="field-input"
                placeholder="jane@example.com"
              />
            </div>

            <p v-if="submitError" class="field-error">{{ submitError }}</p>

            <button type="submit" :disabled="submitting" class="btn-primary w-full">
              <Icon name="check-circle" class="h-4 w-4" />
              {{ submitting ? 'Checking in…' : 'Check in' }}
            </button>
          </form>
        </div>
      </template>
    </div>
  </main>
</template>
