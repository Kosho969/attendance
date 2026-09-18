<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Icon from '../components/Icon.vue'

const auth = useAuthStore()
const router = useRouter()

const currentPassword = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await auth.changePassword({
      current_password: currentPassword.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    })
    router.push({ name: 'activities' })
  } catch (e) {
    const errors = e.response?.data?.errors
    error.value = errors ? Object.values(errors).flat().join(' ') : 'Could not change password.'
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
          <Icon name="lock" class="h-7 w-7" />
        </span>
      </div>

      <div class="surface-card p-8">
        <h1 class="text-xl font-semibold text-slate-900 text-center">
          {{ auth.mustChangePassword ? 'Change your password' : 'Change password' }}
        </h1>
        <p class="text-sm text-slate-500 text-center mt-1 mb-6">
          {{
            auth.mustChangePassword
              ? 'For security, you must set a new password before continuing.'
              : 'Set a new password for your account.'
          }}
        </p>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label class="field-label" for="current_password">Current password</label>
            <input
              id="current_password"
              v-model="currentPassword"
              type="password"
              required
              autocomplete="current-password"
              class="field-input"
            />
          </div>

          <div>
            <label class="field-label" for="password">New password</label>
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
            <label class="field-label" for="password_confirmation">Confirm new password</label>
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
            {{ loading ? 'Saving…' : 'Save new password' }}
          </button>
        </form>
      </div>

      <p v-if="!auth.mustChangePassword" class="text-sm text-slate-500 text-center mt-6">
        <RouterLink :to="{ name: 'activities' }" class="font-medium text-brand-700 hover:text-brand-800">
          Back to activities
        </RouterLink>
      </p>
    </div>
  </main>
</template>
