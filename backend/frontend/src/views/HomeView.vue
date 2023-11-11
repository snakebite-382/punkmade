<template>
  <div id="Home">
    <div id="Loading" v-show="isAuthLoading">
      <FullscreenLoading/>
    </div>

    <div id="Splash-Screen" v-show="!isAuthLoading && !isAuthed">
      <SplashScreen/>
    </div>

    <div id="Feed" v-if="isAuthed">
      <Feed/>
    </div>
  </div>
</template>

<script>
import SplashScreen from '../components/SplashScreen.vue';
import FullscreenLoading from '../components/Loading/Fullscreen.vue';
import Feed from '../components/Feed/Feed.vue';

export default {
  name: "HomeView",

  components: {
    SplashScreen,
    FullscreenLoading,
    Feed
  },

  data() {
    return {
      isAuthed: this.$auth0.isAuthenticated,
      isAuthLoading: this.$auth0.isLoading, 
    }
  },
}
</script>
