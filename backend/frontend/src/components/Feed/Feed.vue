<template>
    <div v-show="!isLoading">
        <h1 v-if="feedStore.initialized">{{ feedStore.getScene(feedStore.currentScene).name }} : {{ getCatName() }}</h1>
        <AuthButton/> | <button @click="toggleCreatePost">{{ showCreatePost ? "close" : "post something" }}</button> <br/><br/>
        <CreatePost v-show="showCreatePost"/>
        <div v-if="feedStore.initialized">
            <SceneNav :scenes="returnNavScenes()" @nav-item-click="sceneNavClick" id="Scene-Nav"/>
            <CategoryNav :categories="returnNavCategories()" @nav-item-click="categoriesNavClick" id="Category-Nav"/>
            <Posts />
        </div>
    </div>
    <div v-show="isLoading">
        <AuthButton/>
        <FullscreenLoading/>
    </div>
    <StatusToaster/>
</template>

<script>
// components
import AuthButton from '../AuthButton.vue';
import Posts from './Posts.vue';
import FullscreenLoading from '../Loading/Fullscreen.vue';
import CreatePost from './CreatePost.vue';
import CategoryNav from './CategoryNav.vue';
import SceneNav from './SceneNav.vue';
import StatusToaster from './StatusToaster.vue'

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
        CategoryNav,
        SceneNav,
        StatusToaster
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
                return {
                    name: category.name,
                }
            })

            return categories
        },

        returnNavScenes() {
            let scenes = this.feedStore.scenes

            scenes = scenes.map(scene => {
                return {
                    name: scene.name,
                    id: scene.name
                }
            })

            return scenes
        },

        categoriesNavClick(data) {
            this.feedStore.switchCategory(data.name)
        },
        sceneNavClick(data) {
            this.feedStore.switchScene(data.id)
        }
    },
}
</script>