import { defineStore } from 'pinia'
import api from '../lib/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('auth_token') || null,
    user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    setSession(token, user) {
      this.token = token
      this.user = user
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(user))
    },
    clearSession() {
      this.token = null
      this.user = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    },
    async register({ name, email, password, password_confirmation }) {
      const { data } = await api.post('/register', { name, email, password, password_confirmation })
      this.setSession(data.token, data.user)
    },
    async login({ email, password }) {
      const { data } = await api.post('/login', { email, password })
      this.setSession(data.token, data.user)
    },
    async logout() {
      try {
        await api.post('/logout')
      } finally {
        this.clearSession()
      }
    },
  },
})
