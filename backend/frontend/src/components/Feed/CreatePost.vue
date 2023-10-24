<template>
    <form @submit="onSubmit">
        <textarea type="text" placeholder="post something..." name="content" id="content-input" v-model="content" autocomplete="off" class="tw-bg-grey tw-p-1 tw-border-solid tw-border-2 tw-border-red tw-leading-tight"/>
        <br><StyledBtn type="submit">post</StyledBtn>
        <div class="preview markdown" v-html="converter.render(content)">
        </div>
    </form>
</template>

<script>
import { feedStore } from '../../stores/FeedStore';
import { mapStores } from 'pinia';
import StyledInput from '../Reusable/StyledInput.vue';
import StyledBtn from '../Reusable/StyledBtn.vue';
import MarkdownIt from "markdown-it";

export default {
    name: 'CreatePost',

    components: {
        StyledInput,
        StyledBtn,
    },

    data() {
        return {
            content: `# Hello \n ## My Dears`,
            converter: new MarkdownIt()
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