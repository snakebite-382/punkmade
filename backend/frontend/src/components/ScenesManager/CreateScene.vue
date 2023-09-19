<template>
    <div id="Create-Scene">
        <div class="loaded" v-if="!isLoading">
            <h1>Create Scene</h1>
            <CreateMap :center="userLocation" :range="range" @update-pos="handleUpdate"/>
            <form @submit="handleSubmit">
                <label for="range">Range(100ths of a degree in lat/lng): </label>
                <input type="text" id="range" name="range" v-model="range">
                <button type="submit">Submit</button>
            </form>
        </div>
        <FullscreenLoading v-show="isLoading"/>
    </div>
</template>

<script>
import CreateMap from './CreateMap.vue';
import FullscreenLoading from '../Loading/Fullscreen.vue';

export default {
    name: "CreateScene",

    components: {
        CreateMap,
        FullscreenLoading
    },

    data() {
        return {
            userLocation: [],
            selectedPos: [],
            isLoading: true,
            range: 10,
            user: this.$auth0.user,
        }
    },

    created() {
        navigator.geolocation.getCurrentPosition(position=> { // get the users location and save it
            this.userLocation = [position.coords.longitude,position.coords.latitude]
            this.selectedPos = this.userLocation;
            this.isLoading = false;
        }, e => {
            console.error(e)
        })
    },

    methods: {
        async handleSubmit(e) {
            e.preventDefault();
            const token = await this.$auth0.getAccessTokenSilently()
            // send the create scene request
            const response = await fetch('http://localhost:5000/api/scenes/create/', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    user: this.user,
                    center: [this.selectedPos[1], this.selectedPos[0]],
                    range: this.range,
                })
            })

            const data = await response.json();

            if(data) { // if we got back data, it worked!
                alert("created!")
            }
        },

        handleUpdate(update) {
            this.selectedPos = update;
        }
    },
}
</script>