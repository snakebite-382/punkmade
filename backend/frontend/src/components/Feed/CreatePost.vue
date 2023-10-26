<template>
    <form @submit="onSubmit">
        <textarea 
            type="text" placeholder="post something..." name="content" id="content-input" v-model="content" autocomplete="off" 
            class="tw-bg-grey tw-p-1 thin-border tw-leading-tight tw-w-full tw-h-[50vh] tw-resize-y"
            maxlength="500"
        />
        <div class="counter">{{ content.length }}/500 characters</div>

        <br><StyledBtn type="submit">post</StyledBtn>

        <div class="preview markdown" v-html="converter.render(content)"></div>
    </form>
</template>

<script>
import { feedStore } from '../../stores/FeedStore';
import { mapStores } from 'pinia';
import StyledInput from '../Reusable/StyledInput.vue';
import StyledBtn from '../Reusable/StyledBtn.vue';
import { converter } from '../../../markdown';

export default {
    name: 'CreatePost',

    components: {
        StyledInput,
        StyledBtn,
    },

    data() {
        return {
            content: `# Post something... \n You can use **Markdown** or plain text \n ![favicon](favicon.ico)`,
            converter
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
            }

            this.content = "" // reset input

            // send that to the backend via the store which will destructure and send it
            await this.feedStore.createPost(newPost);
        },
    }
}
</script>

<style scoped>
textarea {
    outline: none;
}
</style>