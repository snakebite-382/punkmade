<template>
    <div class="comment">
        {{ comment.author }}: {{ comment.content }}
        <button @click="handleReply">{{ (isReplying()) ? 'stop replying' : 'reply'}}</button>
        <button @click="showReplies = !showReplies"> {{ showReplies ? 'stop viewing replies' : 'view replies' }}</button>
        <LikeButton @post-liked="feedStore.likeComment(expectedParents)" :size='16' :fill="comment.liked ? 'red' : 'none'" outline="black"/>
        <div :class="'replies ' + (depth > maxReplyDepth ? 'flattened' : 'unflattened') " v-if="comment.replies.length > 0 && showReplies">
            <Comment v-for="reply in comment.replies" :comment="reply" :key="reply.commentID" :depth="depth + 1" :parents="expectedParents.slice(1)" :postID="postID"/>
        </div>
    </div>
</template>

<script>
import { feedStore } from '../../stores/FeedStore';
import { mapStores } from 'pinia';
import LikeButton from './LikeButton.vue';

export default {
    name: "Comment",
    data() {
        return {
            expectedParents: [this.postID, ...this.parents, this.comment.commentID.toString()],
            maxReplyDepth: 3,
            showReplies: false,
        }
    },
    computed: {
        ...mapStores(feedStore)
    },
    props: {
        comment: Object,
        depth: Number,
        parents: Array,
        postID: String,
    },

    components: {
        LikeButton,
        Comment
    },  

    methods: {
        isReplying() {
            return JSON.stringify(this.expectedParents).localeCompare(JSON.stringify(this.feedStore.newCommentParents)) === 0
        },

        handleReply() {
            let wasReplying = this.isReplying();

            if(!wasReplying) {
                this.showReplies = true;
                this.feedStore.setupCommentParents(this.expectedParents[0], this.expectedParents.slice(1));
            } else {
                this.feedStore.setupCommentParents(this.postID, []);
            }
        },
    },

    async created() {
        this.feedStore.fetchComments(this.expectedParents,100, true);
    },
}
</script>

<style scoped>
svg {
    margin-left: 5px;
    margin-bottom: -3px;
}
.replies.unflattened { 
    margin-left: 10px;
}
</style>