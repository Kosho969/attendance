<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Icon from '../components/Icon.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login({ email: email.value, password: password.value })
    router.push(route.query.redirect || { name: 'activities' })
  } catch (e) {
    error.value = e.response?.data?.message || 'Could not log in.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="min-h-[calc(100vh-4.25rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-brand-50/60 to-slate-50">
    <div class="w-full max-w-sm">
      <div class="flex justify-center mb-6">
        <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md">
          <Icon name="logo" class="h-7 w-7" />
        </span>
      </div>

      <div class="surface-card p-8">
        <h1 class="text-xl font-semibold text-slate-900 text-center">Welcome back</h1>
        <p class="text-sm text-slate-500 text-center mt-1 mb-6">Log in to manage your activities</p>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label class="field-label" for="email">Email</label>
            <input id="email" v-model="email" type="email" required autocomplete="email" class="field-input" />
          </div>

          <div>
            <label class="field-label" for="password">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              class="field-input"
            />
          </div>

          <p v-if="error" class="field-error">{{ error }}</p>

          <button type="submit" :disabled="loading" class="btn-primary w-full">
            {{ loading ? 'Logging in…' : 'Log in' }}
          </button>
        </form>
      </div>

      <p class="text-sm text-slate-500 text-center mt-6">
        No account?
        <RouterLink :to="{ name: 'register' }" class="font-medium text-brand-700 hover:text-brand-800">
          Register
        </RouterLink>
      </p>
    </div>
  </main>
</template>
