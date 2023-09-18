import { defineStore }from 'pinia'
import { roundTo } from '../helpers'

const logPre = "Location Cache Store: "

export const locationStore = defineStore('location', {
    state: () => {
        return {
            cachedLocalities: []
        }
    },

    actions: {
        cacheLocality(lat, lng, name) {
            lat = roundTo(lat, 4)
            lng = roundTo(lng, 4)
            let inCache = this.checkCache(lat, lng);
            if(!inCache) {
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
            lat = roundTo(lat, 4)
            lng = roundTo(lng, 4)
            console.log(logPre + `Checking if lat, lng (${lat}, ${lng}) is stored in cache`)
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
    }
})