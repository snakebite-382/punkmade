<template>
    <div class="comments" @click="onClick">
        <h4 v-show="comments.length === 0">comments go here</h4>
        <Comment v-for="comment in comments" :comment="comment" :key="comment.id" :depth="currentDepth" :maxDepth="maxDepth" :parents="[]" :postID="postID"/>
        <CreateComment :postID="postID"/> 
    </div>
</template>

<script>
import Comment from './Comment.vue';
import CreateComment from './CreateComment.vue';
import { feedStore } from '../../stores/FeedStore';
import { mapStores } from 'pinia';

export default {
    name: "CommentSection",
    data() {
        return {
            currentDepth: 0,
            maxDepth: 3,
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
    }
}
</script>