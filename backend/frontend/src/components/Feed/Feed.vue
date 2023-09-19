<template>
    <div v-show="!isLoading">
        <h1>{{ feedStore.currentScene.name }}</h1>
        <AuthButton/> | <button @click="toggleCreatePost">{{ showCreatePost ? "close" : "post something" }}</button> <br/><br/>
        <CreatePost v-show="showCreatePost"/>
        <Posts v-if="feedStore.initialized"/>
    </div>
    <div v-show="isLoading">
        <FullscreenLoading/>
    </div>
</template>

<script>
// components
import AuthButton from '../AuthButton.vue';
import Posts from './Posts.vue';
import FullscreenLoading from '../Loading/Fullscreen.vue';
import CreatePost from './CreatePost.vue';

// store stuff
import { feedStore } from '../../stores/FeedStore';
import { mapStores } from 'pinia';

export default {
    name: "Feed",

    data() {
        return {
            user: this.$auth0.user,
            isLoading: true,
            showCreatePost: false,
        }
    },

    components: {
        AuthButton,
        Posts,
        FullscreenLoading,
        CreatePost
    },

    computed: {
        ...mapStores(feedStore)
    }, 

    async created() { 
        // set the token
        await this.feedStore.setToken(this.$auth0.getAccessTokenSilently);

        // if the store hasn't been initialized
        if(!this.feedStore.initialized) {
            // initialize the store
            await this.feedStore.fetchInit(this.user);

            // store is initialized
            this.feedStore.initialized = true;
        }
        this.isLoading = false; // stop loading once everything is fetched
    },

    methods: {
        toggleCreatePost() {
            this.showCreatePost = !this.showCreatePost;
        }
    },
}
</script>