<template>
    <form @submit="onSubmit" >
        <textarea 
            type="text" placeholder="post something..." name="content" id="content-input" v-model="content" autocomplete="off" 
            class="tw-bg-grey tw-p-1 thin-border tw-leading-tight tw-w-full tw-h-[50vh] tw-resize-y"
            maxlength="500"
        />
        <div class="counter">{{ content.length }}/500 characters</div>

        <StyledBtn type="submit" class="tw-mt-2 tw-mb-3">post</StyledBtn>

        <div class="preview markdown" v-html="converter.render(content)"></div>
    </form>
</template>

<script>
import { feedStore } from '../../../stores/FeedStore';
import { toaster } from '../../../stores/Toaster'
import { mapStores } from 'pinia';
import StyledInput from '../../Reusable/StyledInput.vue';
import StyledBtn from '../../Reusable/StyledBtn.vue';
import { converter } from '../../../../markdown';

const defaultPost = `# Hello\n## My Dears\n1) OL
* UL\n\n[I'm an inline-style link](https://www.google.com)\n\`code\`\n| Tables        | Are           | Cool |\n| ------------- |:-------------:| -----:|\n| col 3 is      | right-aligned | $1600 |\n| col 2 is      | centered      |   $12 |\n| zebra stripes | are neat      |    $1 |\n> Blockquotes are very handy in email to emulate reply text\n.> This line is part of the same quote.\n---`

export default {
    name: 'CreatePost',

    components: {
        StyledInput,
        StyledBtn,
    },

    data() {
        return {
            content: defaultPost,
            converter
        }
    },

    computed: {
        ...mapStores(feedStore, toaster)
    },

    methods: {
        async onSubmit(e) {
            e.preventDefault();

            this.toasterStore.work("Posting")

            // create the newpost
            let newPost = {
                content: this.content,
                type: 'text',
            }

            this.content = defaultPost// reset input

            // send that to the backend via the store which will destructure and send it
            await this.feedStore.createPost(newPost);

            this.toasterStore.cleanToaster()
        },
    }
}
</script>

<style scoped>
textarea {
    outline: none;
}
</style>
