<template>
    <div class="post thin-border tw-p-3 tw-my-2">
        <h2 class="creator tw-text-xl tw-text-center">{{ post.author }}
        <Seperator class="tw-w-full tw-my-1"/>
        </h2>
        <h3 class="content tw-text-lg">
            <div class="markdown" v-html="converter.render(post.content)">

            </div>
        </h3>
        <h3 class="posting tw-text-xl" v-if="post.posting">POSTING</h3>
        <h4 class="date tw-text-base">{{ new Date(post.timestamp).toLocaleString() }}</h4>
        <div v-if="!post.posting">
            <h4 class="interactions">
                {{ post.likes }} <LikeButton :fill="post.liked ? 'red' : 'none'" @post-liked="$emit('post-liked')"/> 
                <span v-if="post.comments" class="tw-ml-2">
                    {{ Math.max(post.comments.length, post.commentCount) }} <CommentButton fill="none" @toggle-comments="toggleComments"/> 
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
import Seperator from '../Reusable/Seperator.vue';

import MarkdownIt from "markdown-it";

import { feedStore } from '../../stores/FeedStore';
import { mapStores } from 'pinia';

export default {
    name: 'Post',

    computed: {
        ...mapStores(feedStore)
    },

    data() {
        return {
            commentsOpen: false,
            converter: new MarkdownIt()
        }
    },

    props: {
        post: Object
    },

    components: {
        LikeButton,
        CommentButton,
        CommentSection,
        Seperator
    },

    methods: {
        toggleComments() {
            this.commentsOpen = !this.commentsOpen
            if(this.commentsOpen) {
                this.feedStore.setupCommentParents(this.post.postID.toString(), [])
            }
        }
    },

    emits: ['post-liked'],
}
</script>


<style scoped> 
</style>