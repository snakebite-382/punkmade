<template>
    <div id="Reports" class="tw-flex tw-flex-col tw-items-center tw-mt-4">
        <div class="report thin-border tw-my-2 tw-p-2 tw-w-fit tw-flex tw-flex-col tw-items-center" v-for="(report, i) of reports">
            <div class="users-info tw-mb-1">{{ report.reporter }} reported media by {{ report.reportee }}</div>
            <Seperator/>
            <div v-if="report.content" class="content markdown tw-my-2" v-html="converter.render(report.content)"></div>
            <PreviewDocument v-if="!report.content" :doc="{...report.docDetails, firstPage: report.docDetails.pages[0]}"/>
            <div class="vote">
                <span class="tw-mr-2">Vote to remove?</span> {{ report.votes }}<vue-feather type="thumbs-up" :size="18" class="tw-mx-2 tw-h-fit tw--mt-2" @click="() => voteToRemove(report.mediaID, i)"/>
            </div>
        </div>
        <StyledBtn @click="loadReports">Load More</StyledBtn>
    </div>
</template>

<script>
import { feedStore } from '../stores/FeedStore';
import { toaster } from '../stores/Toaster';
import { mapStores } from 'pinia';
import { converter } from '../../markdown'
import {API_ROUTE} from '../../api'
import Seperator from '../components/Reusable/Seperator.vue'
import PreviewDocument from '../components/Library/PreviewDocument.vue';
import StyledBtn from '../components/Reusable/StyledBtn.vue'

export default {
    name: "Reports",

    data() {
        return {
            reports: [],
            scene: new URL(window.location).searchParams.get('scene'), converter,
        }
    },

    components: {
        Seperator,
        PreviewDocument,
        StyledBtn,
    },

    computed: {
        ...mapStores(feedStore, toaster)
    },

    async created() {
        this.toasterStore.work("Loading")

        const tokenFn = this.$auth0.getAccessTokenSilently;

        if(!this.feedStore.socketAuthed) {
            await this.feedStore.setToken(tokenFn);
            await this.feedStore.initSocket();
        }

        this.reports = await this.feedStore.fetchReports(this.scene, this.reports.length, this.reports.length + 100);
        this.toasterStore.cleanToaster()
    },

    methods: {
        async voteToRemove(id, i) {
            this.toasterStore.work("Voting")

            const token = await this.$auth0.getAccessTokenSilently();
            const request = await fetch(`${API_ROUTE}feed/vote_to_remove/`, {
                method: "POST",
                headers: {
                        'Content-Type': "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        scene: this.scene,
                        mediaID: id,
                    })
            });

            const data = await request.json();
            console.log(data)  
            if(data) {
                this.reports.splice(i, 1);
           }

            this.toasterStore.cleanToaster()
        },
        async loadReports() {
            this.toasterStore.work("Loading More")
            const results = await this.feedStore.fetchReports(this.scene, this.reports.length, this.reports.length + 100);
            for(const result of results) {
                this.reports.push(result)
            } 
            this.toasterStore.cleanToaster()
        }
    }
}
</script>
