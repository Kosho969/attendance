<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Icon from '../components/Icon.vue'

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
  <main class="min-h-[calc(100vh-4.25rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-brand-50/60 to-slate-50">
    <div class="w-full max-w-sm">
      <div class="flex justify-center mb-6">
        <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md">
          <Icon name="logo" class="h-7 w-7" />
        </span>
      </div>

      <div class="surface-card p-8">
        <h1 class="text-xl font-semibold text-slate-900 text-center">Create an account</h1>
        <p class="text-sm text-slate-500 text-center mt-1 mb-6">Start hosting and tracking activities</p>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label class="field-label" for="name">Name</label>
            <input id="name" v-model="name" type="text" required autocomplete="name" class="field-input" />
          </div>

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
              autocomplete="new-password"
              class="field-input"
            />
          </div>

          <div>
            <label class="field-label" for="password_confirmation">Confirm password</label>
            <input
              id="password_confirmation"
              v-model="passwordConfirmation"
              type="password"
              required
              autocomplete="new-password"
              class="field-input"
            />
          </div>

          <p v-if="error" class="field-error">{{ error }}</p>

          <button type="submit" :disabled="loading" class="btn-primary w-full">
            {{ loading ? 'Creating account…' : 'Register' }}
          </button>
        </form>
      </div>

      <p class="text-sm text-slate-500 text-center mt-6">
        Already have an account?
        <RouterLink :to="{ name: 'login' }" class="font-medium text-brand-700 hover:text-brand-800">
          Log in
        </RouterLink>
      </p>
    </div>
  </main>
</template>
