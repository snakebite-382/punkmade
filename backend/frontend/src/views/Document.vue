<template>
    <div id="Document" class="tw-flex tw-items-center tw-flex-col">
        <div v-if="!isLoading" class="tw-min-w-[35vw] tw-w-fit tw-max-w-[75vw] tw-h-fit">
            <div class="title tw-text-center tw-text-2xl tw-mt-4 underline">{{ doc.title }}</div>
            <Seperator class="tw-w-full tw-mt-3 tw-mb-4"/>
            <div class="content markdown" v-html="converter.render(doc.pages[currentIndex])">
            </div>
            <div class="nav tw-mt-4 tw-flex tw-justify-between">
                <StyledBtn @click="prev"><vue-feather type="chevron-right" class="tw-rotate-180 tw-p-0.5 tw-mr-1"/></StyledBtn>
                <StyledBtn v-for="(x, index) of doc.pages" @click="currentIndex = index" class="tw-text-xl tw-w-full tw-mx-1">{{ index }}</StyledBtn>
                <StyledBtn @click="next"><vue-feather type="chevron-right" class="tw-p-0.5 tw-ml-1"/></StyledBtn>
                <ReportButton :mediaID="parseInt(docID)" :scene="doc.scene" :iconSize="36" class="tw-ml-2"/>
            </div>
        </div>
        <FullscreenLoading v-show="isLoading"/>
    </div>
</template>

<script>
import FullscreenLoading from '../components/Loading/Fullscreen.vue';
import Seperator from '../components/Reusable/Seperator.vue';
import StyledBtn from '../components/Reusable/StyledBtn.vue';
import { converter } from '../../markdown';
import { API_ROUTE } from '../../api';
import {toaster} from '../stores/Toaster';
import {mapStores} from 'pinia'
import ReportButton from '../components/Feed/Buttons/ReportButton.vue';

export default {
    name: "Document",

    data() {
        return {
            isLoading: true,
            doc: JSON.parse(new URL(window.location).searchParams.get('doc')) || {loaded: false},
            docID: new URL(window.location).searchParams.get('docID'),
            currentIndex: 0,
            converter,
        }
    },

    components: {
        FullscreenLoading,
        Seperator,
        StyledBtn,
        ReportButton
    },

    computed: {
        ...mapStores(toaster)
    },

    async created() {
        if(!this.doc.loaded) {
            this.toasterStore.work("Loading")

            const request = await fetch(`${API_ROUTE}feed/get_document/${this.docID}`)

            const data = await request.json();

            this.doc = data;
        }

        this.isLoading = false;

        this.toasterStore.cleanToaster()
    },

    methods: {
        prev() {
            if(this.currentIndex > 0) {
                this.currentIndex--;
            }
        },

        next() {
            if(this.currentIndex < this.doc.pages.length-1) {

                this.currentIndex++;
            }
        },
    }
}
</script>
