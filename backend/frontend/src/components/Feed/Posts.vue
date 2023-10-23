<template>
    <div id="Posts" v-if="feedStore.getPosts()">
        <div class="post-container" :key="post.id" v-for="(post, index) in feedStore.getPosts()">
            <Post :post="post" @post-liked="() => likePost(index)"/>
        </div>
        <button @click="loadMore" v-if="feedStore.morePostsToLoad">Load More Posts</button>
    </div>
</template>

<script>
import { feedStore } from '../../stores/FeedStore';
import { mapStores } from 'pinia';
import Post from './Post.vue';

export default {
    name: "Posts",

    components: {
        Post,
    },

    computed: {
        ...mapStores(feedStore)
    },

    methods: {
        async likePost(postIndex) {
            await this.feedStore.likePost(postIndex)
        },

        loadMore() {
            this.feedStore.loadMorePosts();
        }
    },
}

</script>

<style scoped>
.post {
    border: 2px solid black;
    width: fit-content;
    margin-top: 10px;
    padding: 5px;
}
</style>