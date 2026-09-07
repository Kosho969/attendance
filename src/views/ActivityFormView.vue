<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../lib/api'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const users = ref([])
const title = ref('')
const subject = ref('')
const hostId = ref('')
const location = ref('')
const startsAt = ref('')
const error = ref('')
const loading = ref(false)

async function loadUsers() {
  const { data } = await api.get('/users')
  users.value = data
  if (auth.user && data.some((u) => u.id === auth.user.id)) {
    hostId.value = auth.user.id
  } else if (data.length) {
    hostId.value = data[0].id
  }
}

onMounted(loadUsers)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    const { data } = await api.post('/activities', {
      title: title.value,
      subject: subject.value,
      host_id: hostId.value,
      location: location.value || null,
      starts_at: startsAt.value || null,
    })
    router.push({ name: 'activity-detail', params: { id: data.id } })
  } catch (e) {
    const errors = e.response?.data?.errors
    error.value = errors ? Object.values(errors).flat().join(' ') : 'Could not create activity.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="max-w-lg mx-auto px-4 py-8">
    <h1 class="text-xl font-semibold text-slate-800 mb-6">New activity</h1>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1" for="title">Title</label>
        <input
          id="title"
          v-model="title"
          type="text"
          required
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1" for="subject">Subject</label>
        <input
          id="subject"
          v-model="subject"
          type="text"
          required
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1" for="host">Host</label>
        <select
          id="host"
          v-model="hostId"
          required
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.name }} ({{ user.email }})
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1" for="location">
          Location <span class="text-slate-400">(optional)</span>
        </label>
        <input
          id="location"
          v-model="location"
          type="text"
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1" for="starts_at">
          Starts at <span class="text-slate-400">(optional)</span>
        </label>
        <input
          id="starts_at"
          v-model="startsAt"
          type="datetime-local"
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-md bg-slate-800 text-white text-sm font-medium py-2 hover:bg-slate-700 disabled:opacity-50"
      >
        {{ loading ? 'Creating...' : 'Create activity' }}
      </button>
    </form>
  </main>
</template>
