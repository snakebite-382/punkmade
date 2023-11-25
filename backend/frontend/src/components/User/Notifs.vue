<template>
    <div id="Notifs">
        <span class="tw-flex tw-justify-between tw-mx-2 tw-text-xl">
            Notifs: <span @click="dismissAll">Dismiss all <vue-feather type="eye"/></span>
        </span>
        <div v-if="!isLoading" class="tw-flex tw-flex-col">
            <div class="notif thin-border tw-p-2 tw-m-2 tw-flex tw-flex-wrap-reverse" v-for="(notif, i) of notifs">
               <div v-if="notif.type === 'like'">
                    <UserLink :name="notif.origin" :authID="notif.originID"/> 
                    liked your post/comment 
                    <span class="markdown" v-html="converter.render(notif.title)"></span>
                </div>

                <span class="tw-w-fit" v-if="notif.type === 'reply'">
                    <UserLink :name="notif.origin" :authID="notif.originID"/>
                    replied
                    <span class="markdown" v-html="converter.render(notif.reply)"></span>
                    to your post/comment
                    <span class="markdown" v-html="converter.render(notif.title)"></span>
                </span>
                <vue-feather type="eye" @click="() => dismiss(notif.mediaID, i)" class="tw-ml-auto tw-m"/>
            </div>
        </div>
        <div v-if="isLoading">Loading</div>
    </div>
</template>

<script>
import {API_ROUTE} from '../../../api.js';
import {toaster} from '../../stores/Toaster.js';
import {mapStores} from 'pinia';
import {converter} from '../../../markdown.js';
import UserLink from "./UserLink.vue"

export default {
    name: "Notifs",

    data() {
        return {
            isLoading: true,
            notifs: [],
            converter
        }
    },

    components: {
        UserLink
    },
    
    computed: {
        ...mapStores(toaster)
    },

    async created() {
        this.toasterStore.work("Loading Notifs") 
        const token = await this.$auth0.getAccessTokenSilently();
        const response = await fetch(`${API_ROUTE}users/get_notifs`, {
            headers: {
                "Authorization": `Bearer ${token}` 
            }
        })

        const data = await response.json();
        console.log(data)  
        if(data) {
            this.notifs = data;
        }

        this.toasterStore.cleanToaster();

        this.isLoading = false;
    },

    methods: {
        async dismiss(id, i) {
            this.toasterStore.work("Dismissing");
            const token = await this.$auth0.getAccessTokenSilently();
            const response = await fetch(`${API_ROUTE}users/dismiss_notif/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                })
            })

            const data = await response.json(); 
            if(data) {
                this.notifs.splice(i, 1) 
            }
            this.toasterStore.cleanToaster()
        },

        async dismissAll() {
            for(let i = 0; i <= this.notifs.length; i++) {
                await this.dismiss(this.notifs[0].mediaID, 0)
            }
        }
    }
}
</script>
