<template>
    <div id="Posts" v-if="feedStore.getPosts()" class="tw-flex tw-items-center tw-flex-col tw-w-full tw-mt-6">
        <div class="post-container" :key="post.id" v-for="(post, index) in feedStore.getPosts()">
            <Post :post="post" @post-liked="() => likePost(index)"/>
        </div>
        <button @click="loadMore" v-if="feedStore.morePostsToLoad">Load More Posts</button>
    </div>
</template>

<script>
import { feedStore } from '../../stores/FeedStore';
import {toaster} from '../../stores/Toaster'
import { mapStores } from 'pinia';
import Post from './Post.vue';

export default {
    name: "Posts",

    components: {
        Post,
    },

    computed: {
        ...mapStores(feedStore, toaster)
    },

    methods: {
        async likePost(postIndex) {
            this.toasterStore.work('Liking')
            await this.feedStore.likePost(postIndex)
            this.toasterStore.cleanToaster()
        },

        loadMore() {
            this.feedStore.loadMorePosts();
        }
    },
}

</script>

<style scoped>
</style>