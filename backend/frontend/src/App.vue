<template>
  <div id="App" :class="`tw-bg-grey tw-w-full tw-min-h-screen tw-text-white tw-snap-none`">
    <NavBar class="tw-absolute tw-top-0 tw-bg-grey" :pages="pages" :active="this.$route.path"><AuthButton/></NavBar>
    <div id="Body">
        <router-view></router-view>
     </div> 
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
