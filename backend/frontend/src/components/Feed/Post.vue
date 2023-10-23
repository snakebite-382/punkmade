<template>
    <div class="post">
        <h2 class="creator">{{ post.author }}</h2>
        <h3 class="content">{{ post.content }}</h3>
        <h3 class="posting" v-if="post.posting">POSTING</h3>
        <h4 class="date">{{ post.timestamp }}</h4>
        <div v-if="!post.posting">
            <h4 class="interactions">
                {{ post.likes }} <LikeButton outline="black" :fill="post.liked ? 'red' : 'none'" @post-liked="$emit('post-liked')"/> 
                <span v-if="post.comments" class="open-comments">
                    {{ Math.max(post.comments.length, post.commentCount) }} <CommentButton outline="black" fill="none" @toggle-comments="commentsOpen = !commentsOpen"/> 
                </span>
            </h4>
            <CommentSection v-if="commentsOpen" :comments="post.comments" :postID="post.postID.toString()"/> 
        </div>
        
    </div>
</template>

<script>
import LikeButton from './LikeButton.vue';
import CommentButton from './CommentButton.vue';
import CommentSection from './CommentSection.vue';
export default {
    name: 'Post',

    data() {
        return {
            commentsOpen: false
        }
    },

    props: {
        post: Object
    },

    components: {
        LikeButton,
        CommentButton,
        CommentSection
    },
    emits: ['post-liked'],
}
</script>


<style scoped> 
svg {
   margin-bottom: -7.5px;
}
.open-comments {
    margin-left: 8px;
}
</style>