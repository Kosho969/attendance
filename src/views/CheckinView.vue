<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '../lib/api'

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
  return new Date(value).toLocaleString()
}
</script>

<template>
  <main class="max-w-sm mx-auto mt-16 px-4">
    <p v-if="loading" class="text-sm text-slate-500">Loading...</p>
    <p v-else-if="loadError" class="text-sm text-red-600">{{ loadError }}</p>

    <template v-else-if="result">
      <div class="bg-white rounded-lg border border-slate-200 p-6 text-center">
        <h1 class="text-lg font-semibold text-slate-800 mb-2">
          {{ result.already_checked_in ? 'Already checked in' : "You're checked in!" }}
        </h1>
        <p class="text-sm text-slate-600">{{ activity.title }}</p>
        <p class="text-sm text-slate-500 mt-2">{{ formatTime(result.checked_in_at) }}</p>
      </div>
    </template>

    <template v-else-if="activity">
      <h1 class="text-xl font-semibold text-slate-800">{{ activity.title }}</h1>
      <p class="text-sm text-slate-500 mb-6">
        {{ activity.subject }} · Host: {{ activity.host?.name }}
      </p>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1" for="name">Name</label>
          <input
            id="name"
            v-model="name"
            type="text"
            required
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1" for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <p v-if="submitError" class="text-sm text-red-600">{{ submitError }}</p>

        <button
          type="submit"
          :disabled="submitting"
          class="w-full rounded-md bg-slate-800 text-white text-sm font-medium py-2 hover:bg-slate-700 disabled:opacity-50"
        >
          {{ submitting ? 'Checking in...' : 'Check in' }}
        </button>
      </form>
    </template>
  </main>
</template>
