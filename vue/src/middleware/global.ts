import { isAuthenticated } from '@/services/auth'
import type { Router } from 'vue-router'

export function setupAuthMiddleware(router: Router) {
  router.beforeEach((to) => {
    if (!isAuthenticated() && to.path !== '/login') {
      return {
        name: '/login',
      }
    }
  })
}
