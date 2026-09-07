<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="bg-white border-b border-slate-200">
    <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
      <RouterLink :to="{ name: 'activities' }" class="text-lg font-semibold text-slate-800">
        Attendance
      </RouterLink>
      <nav v-if="auth.isAuthenticated" class="flex items-center gap-4">
        <span class="text-sm text-slate-500">{{ auth.user?.name }}</span>
        <button
          type="button"
          class="text-sm text-slate-600 hover:text-slate-900"
          @click="handleLogout"
        >
          Log out
        </button>
      </nav>
    </div>
  </header>
</template>
