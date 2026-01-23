import type { Router } from 'vue-router'
import { isAuthenticated } from '@/services/auth'

export function setupAuthMiddleware (router: Router) {
  router.beforeEach(to => {
    if (!isAuthenticated() && to.path !== '/login') {
      return {
        name: '/login',
      }
    }
  })
}
