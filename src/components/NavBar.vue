<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Icon from './Icon.vue'

const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  router.push({ name: 'login' })
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
  <header class="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
      <RouterLink :to="{ name: 'activities' }" class="flex items-center gap-2 group">
        <span
          class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm group-hover:bg-brand-700 transition-colors"
        >
          <Icon name="logo" class="h-5 w-5" />
        </span>
        <span class="text-base font-semibold text-slate-900 tracking-tight">Attendance</span>
      </RouterLink>

      <nav v-if="auth.isAuthenticated" class="flex items-center gap-4">
        <div class="hidden sm:flex items-center gap-2 pr-2">
          <span class="avatar h-8 w-8 text-xs">{{ initials(auth.user?.name) }}</span>
          <span class="text-sm text-slate-600">{{ auth.user?.name }}</span>
        </div>
        <button type="button" class="btn-ghost !px-3 !py-1.5" @click="handleLogout">
          <Icon name="log-out" class="h-4 w-4" />
          <span>Log out</span>
        </button>
      </nav>
    </div>
  </header>
</template>
