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
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
    }),
    new Sentry.Replay(),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],

  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

app.use(router)

app.mount('#app')