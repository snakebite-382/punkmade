<template>
    <div id="Library">
        <div v-show="!isLoading">
            <StyledBtn @click="creating=!creating" class="tw-my-2">{{ creating ? 'Close' : "Create Document" }}</StyledBtn>
            <CreateDocument @submit-form="submit" v-show="creating"/>

            <div class="tw-flex tw-flex-wrap" v-show="this.feedStore.documents && !creating ">
                <!-- previews -->
            </div>

            <StatusToaster/>
        </div>

        <div class="loading" v-show="isLoading">
            <FullscreenLoading/>
        </div>
    </div>
</template>

<script>
import CreateDocument from '../components/Library/CreateDocument.vue';
import FullscreenLoading from '../components/Loading/Fullscreen.vue';
import StatusToaster from '../components/Feed/StatusToaster.vue';
import StyledBtn from '../components/Reusable/StyledBtn.vue';

import {feedStore} from '../stores/FeedStore';
import { mapStores } from 'pinia';

export default {
    name: "Library",

    components: {
    CreateDocument,
    FullscreenLoading,
    StatusToaster,
    StyledBtn
},

    computed: {
        ...mapStores(feedStore)
    },

    data() {
        return {
            scene: new URL(window.location).searchParams.get('scene'),
            isLoading: true,
            creating: false,
        }
    },

    async created() {
        await this.feedStore.setToken(this.$auth0.getAccessTokenSilently);
        this.feedStore.libraryScene = this.scene;

        this.isLoading = false;
    },

    methods: {
        async submit(doc) {
            await this.feedStore.createDocument(doc.title, doc.pages)
        }
    }
}
</script>
