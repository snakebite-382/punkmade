<template>
    <div class="comments">
        <h4 v-show="comments.length === 0">comments go here</h4>
        <Comment v-for="comment in comments" :comment="comment" :key="comment.id" :depth="currentDepth" :maxDepth="maxDepth"/>
        <CreateComment :parents="newCommentParents"/> 
    </div>
</template>

<script>
import Comment from './Comment.vue';
import CreateComment from './CreateComment.vue';

export default {
    name: "CommentSection",
    data() {
        return {
            newCommentParents: [this.postID],
// parents tell our create comment where to append the comment, first el is post id then we go through each id in the array, find the comment and then look for the following ids under it
            currentDepth: 0,
            maxDepth: 3,
            // even though our replies can be addedto essentially infinite depths, at depth 3 we flatten everything
        }
    },
    props: {
        comments: Array,
        postID: String
    },
    components: {
        Comment,
        CreateComment
    },
}
</script>