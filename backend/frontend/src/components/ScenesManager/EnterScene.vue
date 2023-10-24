<template>
    <div id="Create-Scene">
        <div class="loaded" v-if="!isLoading">
            <h1 class="tw-text-xl">Create Scene</h1>
            <CreateMap :center="userLocation" :range="range" @update-pos="handleUpdate"/>
            <form @submit="handleSubmit" v-if="locationStore.mode === 'create'">
                <label for="range">Range: </label>
                <StyledInput type="number" id="range" name="range" min="1" max="30" v-model="range"/>
                <StyledBtn type="submit">Submit</StyledBtn>
            </form>
            <StyledBtn v-if="locationStore.mode === 'join'" @click="handleSubmit">Join {{ locationStore.selectedScene.name }}</StyledBtn>
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
import { mapStores } from 'pinia';

export default {
    name: "CreateScene",

    components: {
        CreateMap,
        FullscreenLoading,
        StyledBtn,
        StyledInput
    },

    computed: {
        ...mapStores(locationStore)
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
        navigator.geolocation.getCurrentPosition(position=> { // get the users location and save it
            this.userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            }
            this.selectedPos = this.userLocation;
        }, e => {
            console.error(e)
        });

        await this.getScenes();

        this.isLoading = false;
    },

    methods: {
        async handleSubmit(e) {
            e.preventDefault();

            const token = await this.$auth0.getAccessTokenSilently()

            let response;

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
            } else {
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
            }


            const data = await response.json();

            if(data) { // if we got back data, it worked!
                alert(`${this.locationStore.mode}ed!`)
                this.getScenes()
            }
        },

        handleUpdate(update) {
            this.selectedPos = update;
        },

        async getScenes() {
           await this.locationStore.getScenes(this.$auth0.getAccessTokenSilently);
        }
    },
}
</script>