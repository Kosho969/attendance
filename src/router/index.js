import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/change-password',
    name: 'change-password',
    component: () => import('../views/ChangePasswordView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    name: 'activities',
    component: () => import('../views/ActivitiesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/activities/new',
    name: 'activity-new',
    component: () => import('../views/ActivityFormView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/activities/:id',
    name: 'activity-detail',
    component: () => import('../views/ActivityDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/checkin/:token',
    name: 'checkin',
    component: () => import('../views/CheckinView.vue'),
  },
]

// Pure so it's testable without a real router/history: given the target route
// and the auth store's state, decide whether to redirect.
export function resolveGuard(to, auth) {
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'activities' }
  }

  if (auth.isAuthenticated && auth.mustChangePassword && to.name !== 'change-password') {
    return { name: 'change-password' }
  }

  return true
}

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => resolveGuard(to, useAuthStore()))

export default router
