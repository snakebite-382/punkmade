<template>
    <h2 class="creator">{{ post.creator.name }}</h2>
    <h3 class="content">{{ post.content }}</h3>
    <h3 class="posting">{{ post.posting ? "POSTING" : "" }}</h3>
    <h4 class="date">{{ post.timestamp }}</h4>
    <h4 class="interactions">{{ post.likes.length }} <LikeButton outline="black" :fill="post.liked ? 'red' : 'none'" @post-liked="$emit('post-liked')"/></h4>
</template>

<script>
import LikeButton from './LikeButton.vue';

export default {
    name: 'Post',

    props: {
        post: Object
    },

    components: {
        LikeButton,
        LikeButton
    },
    emits: ['post-liked']
}
</script>