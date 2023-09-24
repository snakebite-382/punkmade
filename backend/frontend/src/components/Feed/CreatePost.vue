<template>
    <form @submit="onSubmit">
        <label for="content-input">Content:</label>
        <input type="text" name="content" id="content-input" v-model="content" autocomplete="off">
        <button type="submit">post</button>
    </form>
</template>

<script>
import { feedStore } from '../../stores/FeedStore';
import { mapStores } from 'pinia';

export default {
    name: 'CreatePost',

    data() {
        return {
            content: ''
        }
    },

    computed: {
        ...mapStores(feedStore)
    },

    methods: {
        async onSubmit(e) {
            e.preventDefault();

            // create the newpost
            let newPost = {
                content: this.content,
                type: 'text',
                creator: {
                    id: this.feedStore.user.sub,
                    name: this.feedStore.user.nickname
                }
            }

            this.content = "" // reset input

            // send that to the backend via the store which will destructure and send it
            await this.feedStore.createPost(newPost);
        }
    }
}
</script>