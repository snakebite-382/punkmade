<template>
    <div class="map">
        <h1>Will Be Named: {{ sceneName }} {{ sceneName !== "Loading..." ? "Punk" : ""}}</h1>
        <!-- if the scene name is Loading... (the loading name) cut the punk, then if it's a name add the Punk -->
        <ol-map
            :loadTilesWhileAnimating="true"
            :loadTilesWhileInteracting="true"
            style="height: 400px"
            @click="handleClick"
        >
            <ol-view
                ref="view"
                :center="center"
                :zoom="zoom"
                :projection="projection"
            />
            <ol-tile-layer>
                <ol-source-osm />
            </ol-tile-layer>

            <MapCircle :center="selectedPos.length === 2 ? selectedPos : center" :radius="range/100"/>
    </ol-map>
    </div>
</template>

<script>
import MapCircle from './MapCircle.vue';
import {locationStore} from '../../stores/LocationStore';
import {mapStores} from 'pinia'

export default {
    name: "CreateMap",

    components: {
        MapCircle,
    },

    data() {
        return {
            projection: "EPSG:4326", // who really cares what this is 
            zoom: 10, // default zoom
            selectedPos: [],
            sceneName: "Loading..." // start as loading 
        } 
    },

    props: {
        center: Array,
        range: Number,
    },

    computed: {
        ...mapStores(locationStore)
    },

    emits: ["update-pos"],

    methods: {
        handleClick(e) {
            this.selectedPos = e.coordinate;
            this.$emit('update-pos', this.selectedPos)
            this.fetchSceneName(this.selectedPos)
        },

        async fetchSceneName(pos) {
            pos = [pos[1], pos[0]]// flip position because fuck you openlayer
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
        }
    },

    async created() {
        await this.fetchSceneName(this.center)
    }
}
</script>