import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createAuth0 } from '@auth0/auth0-vue';

import VueFeather from 'vue-feather';

import * as Sentry from '@sentry/vue'

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

Sentry.init({
  app,
  dsn: "https://5f8838e1f678677e4db91fc08d0fb1d8@o466290.ingest.sentry.io/4506175687950336",
  integrations: [
    new Sentry.BrowserTracing({
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: ["localhost", 'punkmade.fly.dev', /^https:\/\/yourserver\.io\/api/],
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
    }),
    new Sentry.Replay(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

app.use(router)

app.mount('#app')