import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createAuth0 } from '@auth0/auth0-vue';

import VueFeather from 'vue-feather';

import VueGoogleMaps from '@fawmi/vue-google-maps';

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.component(VueFeather.name, VueFeather);

app.use(createPinia())

app.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyCS9BGDCauKy2Gu9xUJrsK9R872UHpkgSc',
  },
})

app.config.warnHandler = (msg, instance, trace) =>
  ![
    'Extraneous non-emits event listeners (click) were passed to component but could not be automatically inherited because component renders fragment or text root nodes. If the listener is intended to be a component custom event listener only, declare it using the "emits" option.'
  ].some((warning) => msg.includes(warning)) &&
  console.warn('[Vue warn]: '.concat(msg).concat("\n" + trace))

app.use(createAuth0({
  domain: "punkmade.us.auth0.com",
  clientId: "Pw8TzxKzHXe7GqQdty1jKnz7nkmXFtGe",
  authorizationParams: {
    redirect_uri: window.location.origin + "/login-callback",
    audience: "https://punkmade.us.auth0.com/api/v2/"
  }
}))

app.use(router)

app.mount('#app')