<template>
    <div v-show="!isLoading">
        <h1>{{ feedStore.currentScene.name }}</h1>
        <AuthButton/> | <button @click="toggleCreatePost">{{ showCreatePost ? "close" : "post something" }}</button> <br/><br/>
        <CreatePost v-show="showCreatePost"/>
        <Posts/>
    </div>
    <div v-show="isLoading">
        <FullscreenLoading/>
    </div>
</template>

<script>
import AuthButton from '../AuthButton.vue';
import Posts from './Posts.vue';
import FullscreenLoading from '../Loading/Fullscreen.vue';
import CreatePost from './CreatePost.vue';

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
        await this.feedStore.setToken(this.$auth0.getAccessTokenSilently);
        if(!this.feedStore.initialized) {
            await this.feedStore.fetchInit(this.user);
            await this.feedStore.fetchPosts(100);
            this.feedStore.initialized = true;
        }
        this.isLoading = false;
    },

    methods: {
        toggleCreatePost() {
            this.showCreatePost = !this.showCreatePost;
        }
    },
}
</script>