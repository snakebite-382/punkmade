
<template>
  <div id="App" :class="`tw-bg-grey tw-w-full tw-min-h-screen tw-text-white tw-snap-none`">
    <NavBar :pages="pages" :active="this.$route.path"><AuthButton/></NavBar>
    <router-view></router-view>
    <StatusToaster/> 
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue';
import { navRoutes as routes } from './router';
import AuthButton from './components/AuthButton.vue';
import StatusToaster from './components/Reusable/StatusToaster.vue';

export default {
  components: {
    NavBar,
    AuthButton,
    StatusToaster
  },

  data() {
    return {
      pages: routes,
      whiteText: true, // allows switching of green/white text
    }
  }
}
</script>

<style scoped>
</style>
