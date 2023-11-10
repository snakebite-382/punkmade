import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from "@auth0/auth0-vue";
import HomeView from '../views/HomeView.vue';
import SceneManager from '../views/SceneManager.vue';
import LoginCallback from '../views/LoginCallback.vue';
import Library from '../views/Library.vue';
import Document from '../views/Document.vue'
import Onboard from '../views/Onboard.vue';
import Profile from '../views/Profile.vue';
import Report from '../views/Reports.vue';

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
    component: LoginCallback,
    beforeEnter: authGuard
  },
  {
    path: '/library',
    name: 'Library',
    component: Library,
    beforeEnter: authGuard,
  },
  {
    path: '/library/document',
    name: 'Document',
    component: Document
  },
  {
    path: '/onboard',
    name: 'Onboard',
    component: Onboard,
    beforeEnter: authGuard,
  },
  {
    path: '/profile',
    name: "Profile",
    component: Profile,
    beforeEnter: authGuard,
  },
  {
    path: '/reports',
    name: "Reports",
    component: Report,
    beforeEnter: authGuard
  }
]

let navRoutes = [
  {
    path: '/',
    name: 'Home'
  },
  {
    path: '/scenes/',
    name: 'Scenes'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export {navRoutes}
export default router
