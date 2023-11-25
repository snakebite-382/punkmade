<template>
    <div id="Posts"  class="tw-flex tw-items-center tw-flex-col tw-w-full tw-mt-6">
        <div class="post-container" :key="post.id" v-for="(post, index) in category.posts">
            <Post :post="post" @post-liked="() => likePost(index)"/>
        </div>
    </div>
</template>

<script>
import Post from './Post.vue';
import {socket, socketState} from "../../../socket.js";

export default {
    name: "Posts",

    props: {
        category: Object,
    },

    components: {
        Post,
    },

    data() {
        return {
            test: {}
        }  
    },

    async created() {
        console.log(this.category.posts.length);
        for(let i = 0; i < this.category.posts.length; i++) {
            const post = this.category.posts[i];
            socket.emit("stream comments", post.postID, post.comments.length, post.comments.length + 100);
            socketState.comments[post.postID] = []; 
            this.test = socketState;
            console.log("POST", post.postID)
            post.comments = socketState.comments[post.postID];
        }
    }

}

</script>

<style scoped>
</style>
