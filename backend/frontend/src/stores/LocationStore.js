import { defineStore }from 'pinia'
import {randColor} from "../helper"

const logPre = "Location Cache Store: ";
const API = "http://localhost:5000/api/scenes"

export const locationStore = defineStore('location', {
    state: () => {
        return {
            cachedLocalities: [],
            coords: [],
            scenes: [],
            selectedScene: {},
            mode: 'create',
            sceneIn: {},
            myScenes: [],
        }
    },

    actions: {
        cacheLocality(lat, lng, name) {
            this.coords = [lat, lng]
            // check if its already cached
            let inCache = this.checkCache(lat, lng);
            if(!inCache) { // if not add it
                let newEntry = {
                    lat,
                    lng,
                    name
                }

                console.log(logPre + "Storing new entry: " + JSON.stringify(newEntry))
                this.cachedLocalities.push(newEntry)
            }
        },

        checkCache(lat, lng) {
            console.log(logPre + `Checking if lat, lng (${lat}, ${lng}) is stored in cache`)

            // iterates through localities and returns the first one with the right lat, lng (mostly to store user city, but prevents a few unnecessary requests)
            for(let i = 0; i < this.cachedLocalities.length; i++) {
                let locality = this.cachedLocalities[i];

                if(locality.lat === lat && locality.lng === lng) {
                    console.log(logPre + "Stored as " + locality.name)
                    return locality.name
                }
            }
            console.log(logPre + "Not Stored")
            return false
        },

        async getScenes(tokenfn, userCoords) {
            this.myScenes = []
            console.log(userCoords.lng)
            console.log(logPre + "Fetching Scenes")
            let token = await tokenfn();

            let response = await fetch(API + `/get_scenes/${userCoords.lat},${userCoords.lng}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            let data = await response.json();

            this.scenes = data;
            let spokenFor = false; // will only be true if theres a scene theyre within the range of that they're not in to make sure those scenes get precedence over one they're near but in

            this.scenes.forEach(scene => {
                scene.color = randColor();
                scene.accent = randColor();
                if(scene.inSceneRange && !spokenFor) {
                    this.setScene(scene)

                    if(!scene.inScene) {
                        spokenFor = true;
                    }
                }

                if(scene.inScene)  {
                    this.myScenes.push(scene)
                }
            });
            // add caching
        },

        setScene(scene) {
            console.log(logPre + "Selected: " + scene.name);
            if(scene.inScene) {
                this.selectedScene = scene;
                this.mode = 'none'
            } else {
                this.selectedScene = scene;
                this.mode = 'join';
            }
        },

        unselect() {
            console.log(logPre + "Unselecting");
            this.selectedScene = {};
            this.mode = 'create';
        }  
    }
})