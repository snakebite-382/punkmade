<template>
    <div id="Profile" class="tw-flex tw-flex-col tw-items-center tw-mt-10">
        <div class="card-info thin-border tw-p-4 tw-w-[50vw]">
            <h1 class="tw-text-2xl underline tw-text-center">{{ user.name }} <vue-feather @click="showEdit=!showEdit" class="tw-text-xl tw-pl-2" type="edit-2"/></h1>
            <p class="pronouns tw-text-lg tw-text-center"><p v-for="(pronoun, i) of pronouns">{{ pronoun + (i < pronouns.length-1 ? "/": ' ') }}</p></p>
            <Seperator class="tw-h-1 tw-mt-3 tw-mb-2"/>
            <span class="bio tw-text-lg">
                <strong v-for="chunk of splitBio.first"><i>{{ chunk + " " }}</i></strong><i v-for="chunk of splitBio.rest">{{ chunk + " " }}</i>
            </span>

            <EditDetails v-show="showEdit" :check-all="false" @success="changed" class="tw-w-full tw-mx-2 tw-my-8"/>

            <MyScenes class="tw-w-full"/>
            
        </div>
    </div>
</template>

<script>
import { API_ROUTE } from '../../api';
import {toaster} from '../stores/Toaster'
import {mapStores} from 'pinia'
import Seperator from '../components/Reusable/Seperator.vue';
import MyScenes from '../components/ScenesManager/MyScenes.vue';
import EditDetails from '../components/User/EditDetails.vue';

export default {
    name: 'Profile',

    data() {
        return {
            rawUser: new URL(window.location).searchParams.get('user') || this.$auth0.user,
            userID: '',
            user: {},
            splitBio: {
                first: [],
                rest: []
            },
            pronouns: [],
            isLoading: true,
            showEdit: false,
        }
    },

    computed: {
        ...mapStores(toaster)
    },

    components: {
        Seperator,
        MyScenes,
        EditDetails
    },

    async created() {
        this.toasterStore.work("Loading")

        if(typeof this.rawUser.sub === 'string') {
            this.userID = this.rawUser.sub
        } else {
            this.userID = this.rawUser
        }

        const token = await this.$auth0.getAccessTokenSilently()

        const request = await fetch(`${API_ROUTE}users/get_profile/${this.userID}`, {
                headers: {
                    'Content-Type': "application/json",
                    "Authorization": `Bearer ${token}`
                },
        })

        const data = await request.json();

        this.user = data;
        this.splitter()

        this.toasterStore.cleanToaster()
    },

    methods: {
        changed(details) {
            console.log(details.pronouns.length, details.bio.length)
            this.user.name = details.nickname.length > 0 ? details.nickname : this.user.name
            this.user.pronouns = details.pronouns.length > 0 ? details.pronouns : this.user.pronouns
            this.user.bio = details.bio.length > 0 ? details.bio : this.user.bio

            this.splitter()
        },

        splitter() {
            this.splitBio = {
                first: [],
                rest: []
            }

            this.pronouns = []

            let chunks  = this.user.bio.split(' ')

            for(let i = 0; i < chunks.length; i++) {
                if(i < 5) {
                    this.splitBio.first.push(chunks[i])
                } else {
                    this.splitBio.rest.push(chunks[i])
                }
            }

            chunks = this.user.pronouns.split(' ')

            for(let i = 0; i < 3; i++) {
                if(chunks[i]) {
                    this.pronouns.push(chunks[i])
                }
            }
        }
    }
}
</script>

<style>
.pronouns {
    text-decoration: none !important;
}
</style>
