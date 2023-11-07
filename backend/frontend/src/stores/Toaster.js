import { defineStore } from "pinia";

export const toaster = defineStore("toaster", {
    state: () => {
        return {
            status: null,
            text: "",
            toasting: false,
        }
    },

    actions: {
        popToast(job) {
            this.status = job.split(':')[0];
            this.text = job
        },
    
        cleanToaster() {
            this.toasting = false;
            this.status = null,
            this.text = ""
        },

        work(job) {
            this.popToast(`Working: ${job}`)
        },
    }
})