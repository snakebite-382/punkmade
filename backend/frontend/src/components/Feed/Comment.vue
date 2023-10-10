<template>
    <div class="comment">
        {{ comment.creator.name }}: {{ comment.content }}
        <button @click="handleReply">{{ (isReplying()) ? 'stop replying' : 'reply'}}</button>
        <div :class="'replies ' + (depth > maxReplyDepth ? 'flattened' : 'unflattened') ">
            <Comment v-for="reply in comment.replies" :comment="reply" :key="reply.id" :depth="depth + 1" :parents="expectedParents.slice(1)" :postID="postID"/>
        </div>
    </div>
</template>

<script>
import { feedStore } from '../../stores/FeedStore';
import { mapStores } from 'pinia';

export default {
    name: "Comment",
    data() {
        return {
            expectedParents: [this.postID, ...this.parents, this.comment.id.toString()],
            maxReplyDepth: 3
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
    methods: {
        isReplying() {
            return JSON.stringify(this.expectedParents).localeCompare(JSON.stringify(this.feedStore.newCommentParents)) === 0
        },

        handleReply() {
            let wasReplying = this.isReplying();

            if(!wasReplying) {
                this.feedStore.setupCommentParents(this.expectedParents[0], this.expectedParents.slice(1));
            } else {
                this.feedStore.setupCommentParents(this.postID, []);
            }
        },
    },

}
</script>

<style scoped>
.replies.unflattened { 
    margin-left: 10px;
}
</style>