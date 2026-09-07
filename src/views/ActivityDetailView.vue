<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import QrcodeVue from 'qrcode.vue'
import api from '../lib/api'

const route = useRoute()

const activity = ref(null)
const attendances = ref([])
const loading = ref(true)
const error = ref('')

const checkinUrl = computed(() => {
  if (!activity.value) return ''
  return `${window.location.origin}/checkin/${activity.value.qr_token}`
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [activityRes, attendancesRes] = await Promise.all([
      api.get(`/activities/${route.params.id}`),
      api.get(`/activities/${route.params.id}/attendances`),
    ])
    activity.value = activityRes.data
    attendances.value = attendancesRes.data
  } catch (e) {
    error.value = 'Could not load this activity.'
  } finally {
    loading.value = false
  }
}

onMounted(load)

function formatTime(value) {
  return new Date(value).toLocaleString()
}
</script>

<template>
  <main class="max-w-3xl mx-auto px-4 py-8">
    <p v-if="loading" class="text-sm text-slate-500">Loading...</p>
    <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>

    <template v-else-if="activity">
      <div class="mb-6">
        <h1 class="text-xl font-semibold text-slate-800">{{ activity.title }}</h1>
        <p class="text-sm text-slate-500">
          {{ activity.subject }} · Host: {{ activity.host?.name }}
          <span v-if="activity.location"> · {{ activity.location }}</span>
        </p>
      </div>

      <div class="grid gap-6 sm:grid-cols-2">
        <div class="bg-white rounded-lg border border-slate-200 p-6 flex flex-col items-center">
          <QrcodeVue :value="checkinUrl" :size="200" level="M" />
          <p class="text-xs text-slate-500 mt-3 break-all text-center">{{ checkinUrl }}</p>
          <p class="text-sm text-slate-600 mt-2">Attendees scan this to check in.</p>
        </div>

        <div class="bg-white rounded-lg border border-slate-200 p-4">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-semibold text-slate-800">
              Attendance ({{ attendances.length }})
            </h2>
            <button
              type="button"
              class="text-xs text-slate-500 hover:text-slate-800"
              @click="load"
            >
              Refresh
            </button>
          </div>

          <p v-if="attendances.length === 0" class="text-sm text-slate-500">
            No check-ins yet.
          </p>
          <ul v-else class="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            <li
              v-for="record in attendances"
              :key="record.id"
              class="py-2 flex items-center justify-between text-sm"
            >
              <div>
                <p class="text-slate-800">{{ record.attendee.name }}</p>
                <p class="text-slate-500">{{ record.attendee.email }}</p>
              </div>
              <span class="text-slate-500">{{ formatTime(record.checked_in_at) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </main>
</template>
