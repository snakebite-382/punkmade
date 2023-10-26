import { defineStore } from "pinia"
import { socket } from '@/socket';

export const libraryStore = defineStore("library", {
    state: () => {
        return {
            scene: '',
            token: '',
        }
    },

    actions: {
        setScene(name) {
            this.scene = name
        },

        async setToken(tokenfn) {
            this.token = await tokenfn()
        },

        async fetchInit() {

        }
    }
})