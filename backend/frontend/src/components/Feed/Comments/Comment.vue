<template>
    <div class="comment tw-my-2">
        <span class="author tw-text-base">{{ comment.author }}</span> : <span class="content tw-text-sm">{{ comment.content }}</span>
        <span class="reply-interaction tw-text-sm">
            <StyledBtn @click="handleReply" class="tw-p-0.5 tw-mx-2">{{ (isReplying()) ? 'stop replying' : 'reply'}}</StyledBtn>
            <StyledBtn @click="showReplies = !showReplies" class="tw-p-0.5 tw-mr-2"> {{ showReplies ? 'stop viewing replies' : 'view replies' }}</StyledBtn>
        </span>
        <span class="like-interaction">
            {{ comment.likes }} <LikeButton @post-liked="feedStore.likeComment(expectedParents)" :size='18' :fill="comment.liked ? 'red' : 'none'" outline="black"/>
        </span>
        
        <ReportButton class="tw-mx-2" :mediaID="comment.commentID" :scene="feedStore.currentScene"/>
        
        <div :class="'replies ' + (depth > maxReplyDepth ? 'flattened' : 'unflattened') " v-if="comment.replies.length > 0 && showReplies">
            <Comment v-for="reply in comment.replies" :comment="reply" :key="reply.commentID" :depth="depth + 1" :parents="expectedParents.slice(1)" :postID="postID"/>
        </div>
        <div v-if="comment.replies.length === 0 && showReplies">
            <span class="tw-text-sm tw-ml-4">No Replies</span>
        </div>
    </div>
</template>

<script>
import { feedStore } from '../../../stores/FeedStore';
import { mapStores } from 'pinia';
import LikeButton from '../LikeButton.vue';
import StyledBtn from '../../Reusable/StyledBtn.vue';
import ReportButton from '../ReportButton.vue';

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
    Comment,
    StyledBtn,
    ReportButton
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
.replies.unflattened { 
    margin-left: 16px;
}

/* svg {
    margin-top: -10px;
} */
</style>