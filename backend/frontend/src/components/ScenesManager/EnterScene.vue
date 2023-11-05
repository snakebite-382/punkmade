<template>
    <div id="Create-Scene">
        <div class="loaded" v-if="!isLoading">
            <h1 class="tw-text-2xl">Create Scene</h1>
            <CreateMap :center="userLocation" :range="parseFloat(range)" @update-pos="handleUpdate"/>
            <form @submit="handleSubmit" v-if="locationStore.mode === 'create'">
                <label for="range">Range: </label>
                <StyledInput type="number" id="range" name="range" min="10" max="30" v-model="range" class="tw-ml-1"/>
                <StyledBtn type="submit">Submit</StyledBtn>
            </form>
            <StyledBtn v-if="locationStore.mode === 'join'" @click="handleSubmit">Join {{ locationStore.selectedScene.name }}</StyledBtn>
            <h1 v-if="locationStore.mode === 'none'" class="tw-text-lg">Already in scene {{ locationStore.selectedScene.name }}</h1>
        
            <MyScenes @interacted="locationStore.getScenes($auth0.getAccessTokenSilently, userLocation)"/>
        </div>

        <FullscreenLoading v-show="isLoading"/>
    </div>
</template>

<script>
import CreateMap from './CreateMap.vue';
import FullscreenLoading from '../Loading/Fullscreen.vue';
import StyledInput from '../Reusable/StyledInput.vue';
import StyledBtn from '../Reusable/StyledBtn.vue';
import { locationStore } from '../../stores/LocationStore';
import { feedStore } from '../../stores/FeedStore';
import { mapStores } from 'pinia';
import MyScenes from './MyScenes.vue';

export default {
    name: "CreateScene",

    components: {
    CreateMap,
    FullscreenLoading,
    StyledBtn,
    StyledInput,
    MyScenes
},

    computed: {
        ...mapStores(locationStore, feedStore)
    },

    data() {
        return {
            userLocation: [],
            selectedPos: [],
            isLoading: true,
            range: 15,
        }
    },

    async created() {
        navigator.geolocation.getCurrentPosition(async position=> { // get the users location and save it
            this.userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            }
            this.selectedPos = this.userLocation;


            await this.getScenes();

            this.isLoading = false;
        
        }, e => {
            console.error(e)
        });
    },

    methods: {
        async handleSubmit(e) {
            e.preventDefault();

            const token = await this.$auth0.getAccessTokenSilently()

            let response;
            let data;

            if(this.locationStore.mode === 'create') {
                 // send the create scene request
                response = await fetch('http://localhost:5000/api/scenes/create/', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        center: [this.selectedPos.lat, this.selectedPos.lng],
                        range: this.range,
                    })
                })

                this.locationStore.myScenes.push(this.locationStore.selectedScene)

                data = await response.json();
                if(!data) {
                    this.locationStore.myScenes.pop()
                }
            } else if(this.locationStore.mode === 'join'){
                console.log(this.locationStore.selectedScene.name)
                response = await fetch('http://localhost:5000/api/scenes/join', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        sceneName: this.locationStore.selectedScene.name
                    })
                })

                this.locationStore.myScenes.push(this.locationStore.selectedScene)

                data = await response.json();
                if(!data) {
                    this.locationStore.myScenes.pop()
                }
            }

            console.log(data)

            if(data) { // if we got back data, it worked!
                alert(`${this.locationStore.mode === 'create' ? 'created': 'joined'}`)
                await this.getScenes()
                if(this.feedStore.initialized) {
                    await this.feedStore.fetchInit();
                }
            }
        },

        handleUpdate(update) {
            this.selectedPos = update;
        },

        async getScenes() {
           await this.locationStore.getScenes(this.$auth0.getAccessTokenSilently, this.userLocation);
        }
    },
}
</script>