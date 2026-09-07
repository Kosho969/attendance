<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../lib/api'
import { useAuthStore } from '../stores/auth'
import Icon from '../components/Icon.vue'

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
  <main class="max-w-lg mx-auto px-4 sm:px-6 py-10">
    <RouterLink :to="{ name: 'activities' }" class="btn-ghost !px-2 !py-1 -ml-2 mb-4">
      <Icon name="arrow-left" class="h-4 w-4" />
      <span>Back</span>
    </RouterLink>

    <div class="surface-card p-8">
      <h1 class="text-xl font-semibold text-slate-900">New activity</h1>
      <p class="text-sm text-slate-500 mt-1 mb-6">Set the details, then share the QR code with attendees.</p>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="field-label" for="title">Title</label>
          <input id="title" v-model="title" type="text" required class="field-input" placeholder="Opening ceremony" />
        </div>

        <div>
          <label class="field-label" for="subject">Subject</label>
          <input id="subject" v-model="subject" type="text" required class="field-input" placeholder="Welcome talk" />
        </div>

        <div>
          <label class="field-label" for="host">Host</label>
          <select id="host" v-model="hostId" required class="field-input">
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }} ({{ user.email }})
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="field-label" for="location">
              Location <span class="text-slate-400 font-normal">(optional)</span>
            </label>
            <input id="location" v-model="location" type="text" class="field-input" placeholder="Main hall" />
          </div>

          <div>
            <label class="field-label" for="starts_at">
              Starts at <span class="text-slate-400 font-normal">(optional)</span>
            </label>
            <input id="starts_at" v-model="startsAt" type="datetime-local" class="field-input" />
          </div>
        </div>

        <p v-if="error" class="field-error">{{ error }}</p>

        <button type="submit" :disabled="loading" class="btn-primary w-full">
          <Icon name="qr-code" class="h-4 w-4" />
          {{ loading ? 'Creating…' : 'Create activity' }}
        </button>
      </form>
    </div>
  </main>
</template>
