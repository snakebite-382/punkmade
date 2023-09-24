<template>
    <div class="map">
        <h1>Will Be Named: {{ sceneName }} {{ sceneName !== "Loading..." ? "Punk" : ""}}</h1>
        <!-- if the scene name is Loading... (the loading name) cut the punk, then if it's a name add the Punk -->
        <GMapMap
            :center="center"
            :zoom="zoom"
            map-type-id="terrain"
            style="width: 100vw; height: 50vh"
            @click="handleClick"
        > 

            <!-- CURSOR -->
            <MapCircle :center="selectedPos" :radius="range*scale" fill="#0526ff" accent="#000000" @circle-clicked="handleClick" v-if="locationStore.mode === 'create'"/>

            <MapCircle v-for="scene in locationStore.scenes" :center="{lat: scene.center[0], lng: scene.center[1]}" :key="scene._id" :radius="scene.range*scale" :fill="scene.color" :accent="scene.accent" @circle-clicked="() => {sceneClick(scene)}"/>
        </GMapMap>
    </div>
</template>

<script>
import MapCircle from './MapCircle.vue';
import {locationStore} from '../../stores/LocationStore';
import {mapStores} from 'pinia';

export default {
    name: "CreateMap",

    components: {
        MapCircle,
    },

    data() {
        return {
            zoom: 10, // default zoom
            selectedPos: {},
            sceneName: "Loading...", // start as loading
            scale: 1000,
        } 
    },

    props: {
        center: Object,
        range: Number,
    },

    computed: {
        ...mapStores(locationStore)
    },

    methods: {
        handleClick(e) {
            this.locationStore.unselect()

            this.selectedPos = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
            };
            this.$emit('update-pos', this.selectedPos)
            this.fetchSceneName(this.selectedPos)
        },

        async fetchSceneName(pos) {
            pos = [pos.lat, pos.lng]
            this.sceneName = "Loading..." // set it to loading until we get a response
            const token = await this.$auth0.getAccessTokenSilently();

            let inCache = this.locationStore.checkCache(pos[0], pos[1]) // check if its already stored
            
            if(!inCache) { // if it isn't cached
                // get the locality
                const response = await fetch(`http://localhost:5000/api/scenes/get_locality/${pos.join(",")}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })

                const data = await response.json()

                // set the name
                this.sceneName = data.locality;

                // cache it
                this.locationStore.cacheLocality(pos[0], pos[1], this.sceneName)
            } else {
                this.sceneName = inCache // if it's cached just set it to the cached value
            }
        },

        sceneClick(scene) {
            this.locationStore.setScene(scene);
        },
    },

    async created() {
        this.selectedPos = this.center
        await this.fetchSceneName(this.center);
    },

    emits: ["update-pos"]
}
</script>