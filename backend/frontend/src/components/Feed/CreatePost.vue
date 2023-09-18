<template>
    <form @submit="onSubmit">
        <label for="content-input">Content:</label>
        <input type="text" name="content" id="content-input" v-model="content">

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
            content: 'New Post'
        }
    },

    computed: {
        ...mapStores(feedStore)
    },

    methods: {
        async onSubmit(e) {
            console.log(this.feedStore.userID)
            e.preventDefault();
            let newPost = {
                content: this.content,
                type: 'text',
                creator: {
                    id: this.feedStore.user.sub,
                    name: this.feedStore.user.nickname
                }
            }

            await this.feedStore.createPost(newPost);
        }
    }
}
</script>