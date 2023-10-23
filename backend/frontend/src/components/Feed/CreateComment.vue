<template>
    <form class="add-comment" @submit="handleSubmit" v-if="feedStore.newCommentParents[0].localeCompare(postID) === 0">
        <input placeholder="comment" type="text" v-model="content"><button type="submit">comment</button>
    </form>
</template>

<script>
import { feedStore } from '../../stores/FeedStore';
import { mapStores } from 'pinia';

export default {
    name: "CreateComment", 
    data() {
        return {
            content: ''
        }
    },
    props: {
        postID: String,
    },
    computed: {
        ...mapStores(feedStore)
    },
    methods: {
        handleSubmit(e) {
            e.preventDefault();
            this.feedStore.createComment(this.content, this.feedStore.newCommentParents)
            this.content = ''
        }
    }
}
</script>