
<template>
  <div id="App">
    <NavBar :pages="pages"/>
    <router-view></router-view>  
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue';
import { navRoutes as routes } from './router';

export default {
  components: {
    NavBar
  },

  data() {
    return {
      pages: routes
    }
  }
}
</script>

<style scoped>
</style>
