<template>
    <div id="Posts">
        <div class="post" :key="post.id" v-for="(post, index) in feedStore.getPosts()">
            <Post :post="post" @post-liked="() => likePost(index, post.id)"/>
        </div>
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
        async likePost(postIndex, postID) {
            await this.feedStore.likePost(postIndex, postID)
        }
    }
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