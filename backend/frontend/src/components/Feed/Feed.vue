<template> 
    <div id="Feed">
        <div v-show="!isLoading" v-if="feedStore.initialized" :class="`tw-grid grid tw-min-h-full tw-min-w-full`">
            <Nav :class="`sidebar
                    lg:tw-flex-col tw-justify-evenly lg:tw-justify-start
                    tw-row-start-1 tw-col-end-3 tw-col-start-1 lg:tw-col-end-2 
                    tw-border-red tw-border-solid tw-border-4
                    tw-p-4 tw-z-10 
                    ${showCreatePost ? 'tw-w-full tw-col-end-3' : ''} tw-w-full lg:tw-w-fit 
                    tw-fixed tw-bg-grey tw-text-sm md:tw-text-lg lg:tw-text-xl`"
            >

                <Dropdown 
                    :items="returnNavScenes()"
                    @nav-item-click="sceneNavClick"
                    title="Scenes" 
                    :active="feedStore.currentScene"
                />

                <Dropdown
                    :items="returnNavCategories()"
                    @nav-items-click="categoriesNavClick"
                    title="Categories"
                    :active="feedStore.currentCategory"
                />

                <router-link :to="`/library?scene=${encodeURIComponent(feedStore.currentScene)}`">Library</router-link>
                <router-link :to="`/reports?scene=${encodeURIComponent(feedStore.currentScene)}`">Reports</router-link>
                
                <div class="creation">
                    <StyledBtn @click="toggleCreatePost" >{{ showCreatePost ? "close" : "post" }}</StyledBtn> 
                </div> 
            </Nav>
            
 
            <div :class="`center
                    tw-col-start-1 tw-col-end-3 lg:max-xl:tw-ml-[10rem]                    
                    tw-flex tw-flex-col tw-items-center max-lg:tw-mt-[5rem] lg:tw-mt-10`"
                >
                <Posts v-if="!showCreatePost"/>
                <CreatePost v-show="showCreatePost" />
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
import StyledBtn from '../Reusable/StyledBtn.vue';
import Nav from '../Navs/Nav.vue';
import Dropdown from "../Navs/Dropdown.vue"

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
        StyledBtn,
        Nav,
        Dropdown,
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
