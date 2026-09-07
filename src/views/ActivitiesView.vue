<script setup>
import { onMounted, ref } from 'vue'
import api from '../lib/api'
import Icon from '../components/Icon.vue'

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

function initials(name) {
  if (!name) return ''
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatDate(value) {
  if (!value) return null
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
</script>

<template>
  <main class="max-w-5xl mx-auto px-4 sm:px-6 py-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900 tracking-tight">Activities</h1>
        <p class="text-sm text-slate-500 mt-1">Create activities and track who shows up.</p>
      </div>
      <RouterLink :to="{ name: 'activity-new' }" class="btn-primary">
        <Icon name="plus" class="h-4 w-4" />
        <span>New activity</span>
      </RouterLink>
    </div>

    <div v-if="loading" class="grid gap-4 sm:grid-cols-2">
      <div v-for="i in 4" :key="i" class="surface-card p-5 animate-pulse">
        <div class="h-4 w-2/3 bg-slate-200 rounded"></div>
        <div class="h-3 w-1/2 bg-slate-100 rounded mt-3"></div>
        <div class="h-3 w-1/3 bg-slate-100 rounded mt-6"></div>
      </div>
    </div>

    <div v-else-if="error" class="field-error">{{ error }}</div>

    <div v-else-if="activities.length === 0" class="surface-card p-12 text-center">
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Icon name="inbox" class="h-6 w-6" />
      </div>
      <p class="mt-4 text-sm font-medium text-slate-800">No activities yet</p>
      <p class="text-sm text-slate-500 mt-1">Create the first one to get a QR code going.</p>
      <RouterLink :to="{ name: 'activity-new' }" class="btn-primary mt-5">
        <Icon name="plus" class="h-4 w-4" />
        <span>New activity</span>
      </RouterLink>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2">
      <RouterLink
        v-for="activity in activities"
        :key="activity.id"
        :to="{ name: 'activity-detail', params: { id: activity.id } }"
        class="surface-card p-5 hover:shadow-card-hover hover:border-slate-300 transition-all group"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="font-semibold text-slate-900 truncate">{{ activity.title }}</p>
            <span class="badge-brand mt-2">{{ activity.subject }}</span>
          </div>
          <Icon
            name="chevron-right"
            class="h-5 w-5 text-slate-300 group-hover:text-slate-400 transition-colors shrink-0 mt-1"
          />
        </div>

        <div class="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <span class="avatar h-6 w-6 text-[10px]">{{ initials(activity.host?.name) }}</span>
          <span class="truncate">{{ activity.host?.name }}</span>
        </div>

        <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm text-slate-500">
          <span v-if="activity.starts_at" class="flex items-center gap-1.5">
            <Icon name="clock" class="h-4 w-4" />
            {{ formatDate(activity.starts_at) }}
          </span>
          <span v-else-if="activity.location" class="flex items-center gap-1.5">
            <Icon name="map-pin" class="h-4 w-4" />
            {{ activity.location }}
          </span>
          <span v-else></span>

          <span class="badge-success">
            <Icon name="users" class="h-3.5 w-3.5" />
            {{ activity.attendances_count }}
          </span>
        </div>
      </RouterLink>
    </div>
  </main>
</template>
