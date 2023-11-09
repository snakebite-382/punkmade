<template>
    <div class="comment-section">
        <div class="comments tw-ml-3 tw-mt-2 tw-mb-3" @click="onClick">
            <h4 v-show="comments.length === 0">comments go here</h4>
            <Comment v-for="comment in comments" :comment="comment" :key="comment.commentID" :depth="currentDepth" :parents="[]" :postID="postID"/>
        </div>

        <CreateComment :postID="postID"/> 
    </div>
</template>

<script>
import Comment from './Comment.vue';
import CreateComment from './CreateComment.vue';
import { feedStore } from '../../../stores/FeedStore';
import { mapStores } from 'pinia';

export default {
    name: "CommentSection",
    data() {
        return {
            currentDepth: 0,
            // even though our replies can be addedto essentially infinite depths, at depth 3 we flatten everything
        }
    },
    computed: {
        ...mapStores(feedStore)
    },
    props: {
        comments: Array,
        postID: String
    },
    components: {
        Comment,
        CreateComment
    },
    methods: {
        onClick() {
            if(this.feedStore.newCommentParents[0].localeCompare(this.postID) !== 0) {
                this.feedStore.setupCommentParents(this.postID, [])
            }
        }
    },

    async created() {
        this.feedStore.fetchComments([this.postID], 100, true)
    }
}
</script>