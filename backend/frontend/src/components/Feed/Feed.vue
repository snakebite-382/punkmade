<template>
    <div v-show="!isLoading">
        <h1 v-if="feedStore.initialized">{{ feedStore.getScene(feedStore.currentScene).name }} : {{ getCatName() }}</h1>
        <AuthButton/> | <button @click="toggleCreatePost">{{ showCreatePost ? "close" : "post something" }}</button> <br/><br/>
        <CreatePost v-show="showCreatePost"/>
        <div v-if="feedStore.initialized">
            <CategoryNav :categories="returnNavCategories()" @nav-item-click="sceneNavClick" />
            <Posts />
        </div>
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
import CategoryNav from './CategoryNav.vue';

// store stuff
import { feedStore } from '../../stores/FeedStore';
import { mapStores } from 'pinia';

// helper fns
import { capitalizeFirst } from '../../helper';

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
        CreatePost,
        CategoryNav
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
        },

        getCatName() {
            let name = this.feedStore.getCategory(this.feedStore.currentCategory).name
            return capitalizeFirst(name)
        },

        returnNavCategories() {
            let categories = this.feedStore.getScene(this.feedStore.currentScene).categories

            categories = categories.map(category => {
                let newCategory = {
                    name: category.name,
                }

                return newCategory
            })

            return categories
        },

        sceneNavClick(data) {
            this.feedStore.switchCategory(data.name)
        }
    },
}
</script>