<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import QrcodeVue from 'qrcode.vue'
import api from '../lib/api'
import Icon from '../components/Icon.vue'

const route = useRoute()

const activity = ref(null)
const attendances = ref([])
const loading = ref(true)
const error = ref('')
const copied = ref(false)
const refreshing = ref(false)

const checkinUrl = computed(() => {
  if (!activity.value) return ''
  return `${window.location.origin}/checkin/${activity.value.qr_token}`
})

async function load({ silent = false } = {}) {
  if (silent) refreshing.value = true
  else loading.value = true
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
    refreshing.value = false
  }
}

onMounted(() => load())

async function copyLink() {
  await navigator.clipboard.writeText(checkinUrl.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}

function formatTime(value) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })
}

function initials(name) {
  if (!name) return ''
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
</script>

<template>
  <main class="max-w-4xl mx-auto px-4 sm:px-6 py-10">
    <RouterLink :to="{ name: 'activities' }" class="btn-ghost !px-2 !py-1 -ml-2 mb-4">
      <Icon name="arrow-left" class="h-4 w-4" />
      <span>All activities</span>
    </RouterLink>

    <div v-if="loading" class="surface-card p-8 animate-pulse">
      <div class="h-5 w-1/3 bg-slate-200 rounded"></div>
      <div class="h-4 w-1/4 bg-slate-100 rounded mt-3"></div>
    </div>

    <p v-else-if="error" class="field-error">{{ error }}</p>

    <template v-else-if="activity">
      <div class="mb-6">
        <div class="flex flex-wrap items-center gap-2">
          <h1 class="text-2xl font-semibold text-slate-900 tracking-tight">{{ activity.title }}</h1>
          <span class="badge-brand">{{ activity.subject }}</span>
        </div>
        <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
          <span class="flex items-center gap-1.5">
            <span class="avatar h-5 w-5 text-[9px]">{{ initials(activity.host?.name) }}</span>
            {{ activity.host?.name }}
          </span>
          <span v-if="activity.location" class="flex items-center gap-1.5">
            <Icon name="map-pin" class="h-4 w-4" />
            {{ activity.location }}
          </span>
          <span v-if="activity.starts_at" class="flex items-center gap-1.5">
            <Icon name="clock" class="h-4 w-4" />
            {{ formatTime(activity.starts_at) }}
          </span>
        </div>
      </div>

      <div class="grid gap-6 sm:grid-cols-5">
        <div class="surface-card p-6 flex flex-col items-center sm:col-span-2">
          <div class="rounded-xl border border-slate-200 p-3 bg-white">
            <QrcodeVue :value="checkinUrl" :size="180" level="M" :margin="0" />
          </div>
          <p class="text-sm text-slate-600 mt-4 text-center">Attendees scan this to check in.</p>
          <button type="button" class="btn-secondary w-full mt-4" @click="copyLink">
            <Icon :name="copied ? 'check-circle' : 'link'" class="h-4 w-4" />
            {{ copied ? 'Link copied' : 'Copy check-in link' }}
          </button>
        </div>

        <div class="surface-card p-5 sm:col-span-3">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Icon name="users" class="h-4 w-4 text-slate-400" />
              Attendance
              <span class="badge-neutral">{{ attendances.length }}</span>
            </h2>
            <button
              type="button"
              class="btn-ghost !px-2 !py-1 text-xs"
              :disabled="refreshing"
              @click="load({ silent: true })"
            >
              <Icon name="refresh" class="h-3.5 w-3.5" :class="{ 'animate-spin': refreshing }" />
              Refresh
            </button>
          </div>

          <div v-if="attendances.length === 0" class="text-center py-10">
            <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Icon name="qr-code" class="h-5 w-5" />
            </div>
            <p class="text-sm text-slate-500 mt-3">No check-ins yet.</p>
          </div>

          <ul v-else class="divide-y divide-slate-100 max-h-96 overflow-y-auto -mx-1">
            <li
              v-for="record in attendances"
              :key="record.id"
              class="py-2.5 px-1 flex items-center gap-3 text-sm"
            >
              <span class="avatar h-8 w-8 text-xs">{{ initials(record.attendee.name) }}</span>
              <div class="min-w-0 flex-1">
                <p class="text-slate-800 truncate">{{ record.attendee.name }}</p>
                <p class="text-slate-500 truncate text-xs">{{ record.attendee.email }}</p>
              </div>
              <span class="text-slate-500 text-xs shrink-0">{{ formatTime(record.checked_in_at) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </main>
</template>
