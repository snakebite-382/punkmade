<template>
    <div class="post thin-border tw-p-3 tw-my-2 tw-max-w-[75vw] tw-w-fit">
        <UserLink :authID="post.author.userID" :name="post.author.name"/> 
        <Seperator class="tw-w-full tw-my-1"/>
        <h3 class="content tw-text-lg">
            <div class="markdown" v-html="converter.render(post.content)">

            </div>
        </h3>
        <h3 class="posting tw-text-xl" v-if="post.posting">POSTING</h3>
        <h4 class="date tw-text-base">{{ new Date(post.timestamp).toLocaleString() }}</h4>
        <div v-if="!post.posting">
            <h4 class="interactions">
                {{ post.likes }} <LikeButton :fill="post.liked ? 'red' : 'none'" @post-liked="$emit('post-liked')"/> 
                <span v-if="post.comments" class="tw-mx-2">
                    {{ Math.max(post.comments.length, post.commentCount) }} <CommentButton fill="none" @toggle-comments="toggleComments"/> 
                </span> <!--
<ReportButton :mediaID="post.postID" :scene="feedStore.currentScene" @reported="feedStore.removePost(post.postID)"/> -->
            </h4>
            <CommentSection v-if="commentsOpen" :comments="post.comments" :postID="post.postID.toString()"/> 
        </div>
        
    </div>
</template>

<script>
import LikeButton from '../Buttons/LikeButton.vue';
import CommentButton from '../Comments/CommentButton.vue';
import CommentSection from '../Comments/CommentSection.vue';
import Seperator from '../../Reusable/Seperator.vue';
import ReportButton from '../Buttons/ReportButton.vue';
import UserLink from "../../User/UserLink.vue"

import { converter } from '../../../../markdown';

export default {
    name: 'Post',

    data() {
        return {
            commentsOpen: false,
            converter,
        }
    },

    props: {
        post: Object
    },

    components: {
        LikeButton,
        CommentButton,
        CommentSection,
        Seperator,
        ReportButton,
        UserLink,
    },

    methods: {
        toggleComments() {
            this.commentsOpen = !this.commentsOpen
        }
    },

    emits: ['post-liked'],

    async created() {

    }
}
</script>


<style scoped> 
</style>
