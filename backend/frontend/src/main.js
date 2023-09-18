import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createAuth0 } from '@auth0/auth0-vue';

import OpenLayersMap from "vue3-openlayers";
import "vue3-openlayers/styles.css";

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())

app.use(createAuth0({
    domain: "punkmade.us.auth0.com",
    clientId: "Pw8TzxKzHXe7GqQdty1jKnz7nkmXFtGe",
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience: "https://punkmade.us.auth0.com/api/v2/"
    }
}))

app.use(OpenLayersMap, {})

app.use(router)

app.mount('#app')
