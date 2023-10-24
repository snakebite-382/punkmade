<template>
    <form class="add-comment" @submit="handleSubmit" v-if="feedStore.newCommentParents[0].localeCompare(postID) === 0">
        <StyledInput placeholder="comment" type="text" v-model="content"/><StyledBtn type="submit" >comment</StyledBtn>
    </form>
</template>

<script>
import StyledInput from '../Reusable/StyledInput.vue';
import StyledBtn from '../Reusable/StyledBtn.vue';
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
        },
    },
    components: {
        StyledInput,
        StyledBtn
    }
}
</script>