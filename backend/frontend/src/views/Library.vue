<template>
    <div id="Library">
        <div v-show="!isLoading">
            <StyledBtn @click="creating=!creating" class="tw-my-2">{{ creating ? 'Close' : "Create Document" }}</StyledBtn>
            <CreateDocument @submit-form="submit" v-show="creating"/>

            <div class="tw-flex tw-justify-evenly tw-flex-wrap" v-show="!creating ">
                <!-- previews -->
                <div v-for="doc of feedStore.libraryDocuments" id="document.timestamp">
                    <PreviewDocument :doc="{...doc, firstPage: doc.pages[0]}"/>
                </div>
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
import PreviewDocument from '../components/Library/PreviewDocument.vue';

import {feedStore} from '../stores/FeedStore';
import { mapStores } from 'pinia';

export default {
    name: "Library",

    components: {
    CreateDocument,
    FullscreenLoading,
    StatusToaster,
    StyledBtn,
    PreviewDocument,

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

        this.feedStore.fetchDocuments(100);

        this.isLoading = false;
    },

    methods: {
        async submit(doc) {
            await this.feedStore.createDocument(doc.title, doc.pages)
        }
    }
}
</script>
