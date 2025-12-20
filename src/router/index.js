import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import MerchantHome from '../views/MerchantHome.vue'
import NotFound from '../views/NotFound.vue'
import { isAuthenticated } from '../utils/auth'

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'LoginPage', component: LoginPage, meta: { requiresGuest: true } },
    { path: '/merchants/:id', name: 'MerchantHome', component: MerchantHome, props: true, meta: { requiresAuth: true } },
    { path: '/merchants', name: 'Merchants', component: MerchantHome, meta: { requiresAuth: true } },
    // 404 catch-all route - must be last
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
]


const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Navigation guard to protect routes
router.beforeEach((to, from, next) => {
  const authenticated = isAuthenticated()
  
  // Route requires authentication
  if (to.meta.requiresAuth && !authenticated) {
    // Redirect to login
    next({ name: 'LoginPage' })
  } 
  // Route is for guests only (like login page)
  else if (to.meta.requiresGuest && authenticated) {
    // Redirect to merchants page if already logged in
    next({ name: 'Merchants' })
  } 
  else {
    // Allow navigation
    next()
  }
})

export default router