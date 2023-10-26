<template>
    <div id="Library">
        <div v-show="!isLoading">
            <CreateDocument/>

            <div class="tw-flex tw-flex-wrap">
                <!-- previews -->
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

import {libraryStore} from '../stores/LibraryStore';
import { mapStores } from 'pinia';

export default {
    name: "Library",

    components: {
        CreateDocument,
        FullscreenLoading
    },

    computed: {
        ...mapStores(libraryStore)
    },

    data() {
        return {
            scene: new URL(window.location).searchParams.get('scene'),
            isLoading: true,
        }
    },

    async created() {
        this.libraryStore.setScene(this.scene)
        await this.libraryStore.setToken(this.$auth0.getAccessTokenSilently)
        this.isLoading = false;
    }
}
</script>