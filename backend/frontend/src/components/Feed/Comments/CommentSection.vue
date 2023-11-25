<template>
    <div class="comment-section">
        <div class="comments tw-ml-3 tw-mt-2 tw-mb-3">
            <h4 v-show="comments.length === 0">comments go here</h4>
            <Comment v-for="comment in comments" :comment="comment" :key="comment.commentID" :depth="currentDepth" :parents="[]" :postID="postID"/>
        </div>

        <CreateComment :postID="postID"/> 
    </div>
</template>

<script>
import Comment from './Comment.vue';
import CreateComment from './CreateComment.vue';
import {socket, socketState} from "../../../socket.js";

export default {
    name: "CommentSection",
    props: {
        comments: Array,
        postID: String,
    },
    components: {
        Comment,
        CreateComment
    },
    methods: {
    },
}
</script>
