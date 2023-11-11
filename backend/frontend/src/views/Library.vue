<template>
    <div id="Library">
        <div v-show="!isLoading" class="tw-flex tw-flex-col tw-items-center">
            <StyledBtn @click="creating=!creating" class="tw-my-2 tw-w-fit">{{ creating ? 'Close' : "Create Document" }}</StyledBtn>
            <CreateDocument @submit-form="submit" v-show="creating"/>

            <div class="tw-flex tw-justify-center tw-flex-wrap" v-show="!creating ">
                <!-- previews -->
                <div v-for="doc of feedStore.libraryDocuments" :id="doc.timestamp">
                    <PreviewDocument :scene="scene" :doc="{...doc, firstPage: doc.pages[0]}"/>
                </div>
            </div>

            <StyledBtn class="tw-w-fit" @click="fetchMore">Load More</StyledBtn>
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

const BATCHSIZE = 100;

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

        await this.feedStore.fetchDocuments(BATCHSIZE);

        this.isLoading = false;

        this.toasterStore.cleanToaster()
    },

    methods: {
        async submit(doc) {
            this.toasterStore.work("Creating Document")
            await this.feedStore.createDocument(doc.title, doc.pages)
            this.toasterStore.cleanToaster()
        },

        async fetchMore() {
            this.toasterStore.work("Trying to get more")
            await this.feedStore.fetchDocuments(BATCHSIZE);
            this.toasterStore.cleanToaster()
        }
    }
}
</script>
