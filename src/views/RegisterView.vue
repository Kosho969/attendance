<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await auth.register({
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    })
    router.push({ name: 'activities' })
  } catch (e) {
    const errors = e.response?.data?.errors
    error.value = errors ? Object.values(errors).flat().join(' ') : 'Could not register.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="max-w-sm mx-auto mt-16 px-4">
    <h1 class="text-xl font-semibold text-slate-800 mb-6">Create an account</h1>

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

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1" for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1" for="password_confirmation">
          Confirm password
        </label>
        <input
          id="password_confirmation"
          v-model="passwordConfirmation"
          type="password"
          required
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-md bg-slate-800 text-white text-sm font-medium py-2 hover:bg-slate-700 disabled:opacity-50"
      >
        {{ loading ? 'Creating account...' : 'Register' }}
      </button>
    </form>

    <p class="text-sm text-slate-500 mt-4">
      Already have an account?
      <RouterLink :to="{ name: 'login' }" class="text-slate-800 underline">Log in</RouterLink>
    </p>
  </main>
</template>
