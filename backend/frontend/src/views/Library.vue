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
        </div>

        <div class="loading" v-show="isLoading">
            <FullscreenLoading/>
        </div>
    </div>
</template>

<script>
import CreateDocument from '../components/Library/CreateDocument.vue';
import FullscreenLoading from '../components/Loading/Fullscreen.vue';
import StyledBtn from '../components/Reusable/StyledBtn.vue';
import PreviewDocument from '../components/Library/PreviewDocument.vue';

import {feedStore} from '../stores/FeedStore';
import {toaster} from '../stores/Toaster'
import { mapStores } from 'pinia';

export default {
    name: "Library",

    components: {
    CreateDocument,
    FullscreenLoading,
    StyledBtn,
    PreviewDocument,

},

    computed: {
        ...mapStores(feedStore, toaster)
    },

    data() {
        return {
            scene: new URL(window.location).searchParams.get('scene'),
            isLoading: true,
            creating: false,
        }
    },

    async created() {
        this.toasterStore.work("Loading Documents")
        await this.feedStore.setToken(this.$auth0.getAccessTokenSilently);
        this.feedStore.libraryScene = this.scene;

        await this.feedStore.fetchDocuments(100);

        this.isLoading = false;

        this.toasterStore.cleanToaster()
    },

    methods: {
        async submit(doc) {
            this.toasterStore.work("Creating Document")
            await this.feedStore.createDocument(doc.title, doc.pages)
            this.toasterStore.cleanToaster()
        }
    }
}
</script>
