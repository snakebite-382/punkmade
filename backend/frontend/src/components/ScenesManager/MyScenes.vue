<template>
    <div id="MyScenes">
        <div class="scene thin-border tw-m-2 tw-p-2 tw-flex tw-items-center" v-for="scene of (locationStore.myScenes.length != scenes.length && locationStore.myScenes.length > 0 ? locationStore.myScenes: scenes)" :key="scene.name">
            <h1 class="tw-text-lg underline">{{ scene.name }}</h1>
            <span class="interact tw-ml-auto">
                <span class="prefer tw-mr-1" @click="() => clickPrefer(scene)"><vue-feather type="star" :fill="scene.preferred ? '#e0ce07' : 'none'"/></span>
                <span class="delete" @click="() => clickDelete(scene)"><vue-feather type="x"/></span>
            </span>
        </div>
    </div>
</template>

<script>
import { locationStore } from '../../stores/LocationStore';
import { feedStore } from '../../stores/FeedStore';
import { mapStores } from 'pinia';
import { API_ROUTE } from '../../../api';

export default {
    name: "MyScenes",

    data() {
        return {
            scenes: []
        }
    },

    computed: {
        ...mapStores(locationStore, feedStore)
    },

    methods: {
        async clickDelete(scene) {
            let sure = confirm('This will remove you from the scene and delete all the content you posted there permantly, are you sure you want to do this?');
            console.log(sure);
            if(sure) {
                const token = await this.$auth0.getAccessTokenSilently();

                let request = await fetch(API_ROUTE + 'users/leave_scene', {
                    method: 'POST',
                    headers: {
                        'Content-Type': "application/json",
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        scene: scene.name
                    })
                })

                const data = await request.json()
                if(data) {
                    this.scenes = data
                    this.$emit('interacted')
                    if(this.feedStore.initialized) {
                        await this.feedStore.fetchInit()
                    }
                }
            }
        },

        async clickPrefer(scene) {
            const token = await this.$auth0.getAccessTokenSilently();

            let request = await fetch(API_ROUTE + 'users/prefer_scene', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': "application/json",
                },
                body: JSON.stringify({
                    scene: scene.name,
                })
            })

            const data = await request.json()
            this.scenes = data;
            this.$emit('interacted')
            if(this.feedStore.initialized) {
                await this.feedStore.fetchInit()
            }
        }
    },

    async created() {
        const token = await this.$auth0.getAccessTokenSilently();

        let request = await fetch(API_ROUTE + 'scenes/get_my_scenes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        const data = await request.json();

        this.scenes = data
    }
}
</script>