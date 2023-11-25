<template> 
    <div id="Feed">
        <div v-if="!isLoading"  :class="`tw-grid grid tw-min-h-full tw-min-w-full`">
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
                    @nav-item-click="categoriesNavClick"
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
                <Posts v-show="!showCreatePost" v-if="getCategory(currentScene, currentCategory).posts.length > 0" :category="getCategory(currentScene, currentCategory)"/>
                <CreatePost v-show="showCreatePost" />
            </div>
        </div>
        <div v-if="isLoading">;
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

import {API_ROUTE} from '../../../api.js';

import {socketState, socket, initSocket} from '../../socket.js'

export default {
    name: "Feed",

    data() {
        return {
            user: this.$auth0.user,
            isLoading: true,
            showCreatePost: false,
            scenes: [],
            currentScene: "",
            currentCategory: "general", 
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
       
        const token = await this.$auth0.getAccessTokenSilently();

        const response = await fetch(`${API_ROUTE}feed/get_feed_init_data/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        this.scenes = data.scenes;
        this.currentScene = data.preferredScene;

        await initSocket(token);

        this.loadPostsInto(this.currentCategory);

        this.isLoading = false;

        this.toasterStore.cleanToaster();
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
            let categories = this.getScene(this.currentScene)

            categories = categories.categories
 
            categories = categories.map(category => {
                return {
                    name: category.name,
                }
            })

            return categories
        },

        getScene(name) {
            for(let i = 0; i < this.scenes.length; i++) {
                if(this.scenes[i].name === name) {
                    return this.scenes[i]
                }
            }
        },

        getCategory(sceneName, cat) {
            const scene = this.getScene(sceneName);

            for(const category of scene.categories) {
                if(cat === category.name) {
                    return category;
                }
            }
        },

        returnNavScenes() {
            let scenes = this.scenes

            scenes = scenes.map(scene => {
                return {
                    name: scene.name,
                    id: scene.name
                }
            })
            return scenes
        },

        categoriesNavClick(data) {
            this.currentCategory = data.name;
            this.loadPostsInto(this.currentCategory)
        },
        
        sceneNavClick(data) {
            this.currentScene = data.name;
            thisl.categoriesNavClick('general')
        },
            
        async loadPostsInto(category) {
            // save last 
            const currentCat = this.getCategory(this.currentScene, this.currentCategory)
            currentCat.posts = [...currentCat.posts];

            const cat = this.getCategory(this.currentScene, category);

            socketState.posts = [...cat.posts];

            socket.emit('stream posts', this.currentScene, category, cat.posts.length, cat.posts.length + 100);

            cat.posts = socketState.posts;
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
