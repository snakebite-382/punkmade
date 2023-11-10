<template> 
    <div id="Feed">
        <div v-show="!isLoading" v-if="feedStore.initialized" :class="`${showCreatePost ? '' : 'tw-grid grid'} tw-min-h-full tw-min-w-full`">
            <Nav :class="`sidebar
                        lg:tw-flex-col tw-justify-evenly lg:tw-justify-start
                        tw-row-start-1 tw-col-end-3 tw-col-start-1 lg:tw-col-end-2 
                        tw-border-red tw-border-solid tw-border-4
                        tw-h-fit tw-p-4 tw-z-10 
                        tw-w-full lg:tw-w-fit ${showCreatePost ? 'tw-h-full tw-w-full' : ''} 
                        tw-fixed tw-bg-grey tw-text-sm md:tw-text-lg lg:tw-text-xl`">
                <SceneNav :scenes="returnNavScenes()" @nav-item-click="sceneNavClick" id="Scene-Nav"/>
                <CategoryNav :categories="returnNavCategories()" @nav-item-click="categoriesNavClick" id="Category-Nav"/>
                <router-link :to="`/library?scene=${encodeURIComponent(feedStore.currentScene)}`">Library</router-link>
                <router-link :to="`/reports?scene=${encodeURIComponent(feedStore.currentScene)}`">Reports</router-link>
                <div class="creation lg:tw-mt-2">
                    <StyledBtn @click="toggleCreatePost" class="tw-m">{{ showCreatePost ? "close" : "post" }}</StyledBtn> 
                    <CreatePost v-show="showCreatePost" class="tw-mt-2"/>
                </div>
            </Nav>

            <div :class="`center
                    tw-col-start-1 tw-col-end-3 lg:max-xl:tw-ml-[10rem]                    
                    tw-flex tw-flex-col tw-items-center max-lg:tw-mt-[5rem]`"
                v-show="!showCreatePost">
                <Posts/>
            </div>
        </div>
        <div v-show="isLoading">
            <FullscreenLoading/>
        </div>
    </div>
</template>

<script>
// components
import Posts from './Posts/Posts.vue';
import FullscreenLoading from '../Loading/Fullscreen.vue';
import CreatePost from './Posts/CreatePost.vue';
import CategoryNav from './Navs/CategoryNav.vue';
import SceneNav from './Navs/SceneNav.vue';
import StyledBtn from '../Reusable/StyledBtn.vue';
import Nav from '../Nav.vue';

import '../../assets/markdown.scss'

// store stuff
import { feedStore } from '../../stores/FeedStore';
import {toaster} from '../../stores/Toaster'
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
        StyledBtn,
        Nav,
    },

    computed: {
        ...mapStores(feedStore, toaster)
    }, 

    async created() { 
        this.toasterStore.work("Loading")

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

        this.toasterStore.cleanToaster()
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
