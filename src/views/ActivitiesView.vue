<script setup>
import { onMounted, ref } from 'vue'
import api from '../lib/api'

const activities = ref([])
const loading = ref(true)
const error = ref('')

async function loadActivities() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/activities')
    activities.value = data
  } catch (e) {
    error.value = 'Could not load activities.'
  } finally {
    loading.value = false
  }
}

onMounted(loadActivities)
</script>

<template>
  <main class="max-w-5xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-semibold text-slate-800">Activities</h1>
      <RouterLink
        :to="{ name: 'activity-new' }"
        class="rounded-md bg-slate-800 text-white text-sm font-medium px-4 py-2 hover:bg-slate-700"
      >
        New activity
      </RouterLink>
    </div>

    <p v-if="loading" class="text-sm text-slate-500">Loading...</p>
    <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
    <p v-else-if="activities.length === 0" class="text-sm text-slate-500">
      No activities yet. Create the first one.
    </p>

    <ul v-else class="divide-y divide-slate-200 bg-white rounded-lg border border-slate-200">
      <li v-for="activity in activities" :key="activity.id">
        <RouterLink
          :to="{ name: 'activity-detail', params: { id: activity.id } }"
          class="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
        >
          <div>
            <p class="text-sm font-medium text-slate-800">{{ activity.title }}</p>
            <p class="text-sm text-slate-500">
              {{ activity.subject }} · Host: {{ activity.host?.name }}
            </p>
          </div>
          <span class="text-sm text-slate-500">
            {{ activity.attendances_count }} checked in
          </span>
        </RouterLink>
      </li>
    </ul>
  </main>
</template>
