<template>
    <form class="add-comment" @submit="handleSubmit">
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
    computed: {
        ...mapStores(feedStore)
    },
    props: {
        parents: Array
    },
    methods: {
        handleSubmit(e) {
            e.preventDefault();
            this.feedStore.createComment(this.content, this.parents)
        }
    }
}
</script>