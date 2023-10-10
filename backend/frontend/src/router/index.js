import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from "@auth0/auth0-vue";
import HomeView from '../views/HomeView.vue';
import SceneManager from '../views/SceneManager.vue';
import LoginCallback from '../views/LoginCallback.vue'

export const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/scenes/',
    name: 'scene-manager',
    component: SceneManager,
    beforeEnter: authGuard
  },
  {
    path:'/login-callback',
    name: 'login-callback',
    component: LoginCallback
  }
]

let navRoutes = [
  routes[0],
  routes[1]
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export {navRoutes}
export default router