import { defineStore }from 'pinia'

const logPre = "Location Cache Store: "

export const locationStore = defineStore('location', {
    state: () => {
        return {
            cachedLocalities: []
        }
    },

    actions: {
        cacheLocality(lat, lng, name) {
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
    }
})