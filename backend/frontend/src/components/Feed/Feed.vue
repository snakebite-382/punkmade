<template>
    <div id="Feed" class="">
        <div v-show="!isLoading" v-if="feedStore.initialized" :class="`${showCreatePost ? '' : 'tw-grid grid'} tw-min-h-full`">
            <Nav :class="`sidebar tw-flex-col tw-col-start-1 tw-justify-start tw-border-red tw-border-solid tw-border-4 tw-h-fit tw-p-4 tw-text-xl tw-row-start-1 tw-z-10 ${showCreatePost ? 'tw-h-full' : ''}`">
                <SceneNav :scenes="returnNavScenes()" @nav-item-click="sceneNavClick" id="Scene-Nav"/>
                <CategoryNav :categories="returnNavCategories()" @nav-item-click="categoriesNavClick" id="Category-Nav"/>
                <span><a :href="`/library?scene=${encodeURIComponent(feedStore.currentScene)}`">Library</a></span>
                <div class="creation tw-text-lg tw-mt-2">
                    <StyledBtn @click="toggleCreatePost" class="tw-m">{{ showCreatePost ? "close" : "post something" }}</StyledBtn> 
                    <CreatePost v-show="showCreatePost" class="tw-mt-2"/>
                </div>
            </Nav>
            
            <div class="center tw-col-start-1 tw-col-span-2 tw-row-start-1 tw-flex tw-flex-col tw-items-center" v-show="!showCreatePost">
                <Posts/>
            </div>
        </div>
        <div v-show="isLoading">
            <FullscreenLoading/>
        </div>
        <StatusToaster/>
    </div>
</template>

<script>
// components
import Posts from './Posts.vue';
import FullscreenLoading from '../Loading/Fullscreen.vue';
import CreatePost from './CreatePost.vue';
import CategoryNav from './CategoryNav.vue';
import SceneNav from './SceneNav.vue';
import StatusToaster from './StatusToaster.vue'
import StyledBtn from '../Reusable/StyledBtn.vue';
import Nav from '../Nav.vue';

import '../../assets/markdown.scss'

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
        Posts,
        FullscreenLoading,
        CreatePost,
        CategoryNav,
        SceneNav,
        StatusToaster,
        StyledBtn,
        Nav,
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

<style scoped>
.grid {
    grid-template-columns: max-content 1fr;
}

.sidebar {
    margin-top: -4px;
}
</style>