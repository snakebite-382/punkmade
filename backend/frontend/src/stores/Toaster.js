import { defineStore } from "pinia";

export const toaster = defineStore("toaster", {
    state: () => {
        return {
            status: null,
            lastStatus: null,
            show: false,
            text: "",
            wasWorking: false
        }
    },

    actions: {
        popToast(job, isSuccess = false, isCopied = false) {
            this.show = true;

            if(isSuccess) {
                this.status = "success"
                this.lastStatus = this.status
                this.text = "Success!"
                return 
            }

            if(isCopied) {
                this.status = "success"
                this.text = "Copied!"
                return
            }

            this.status = job.split(':')[0].toLowerCase();
            this.text = job;
            this.lastStatus = this.status;
        },
    
        async cleanToaster(wait = 0) {
            await new Promise(resolve => setTimeout(resolve, wait))

            if(this.wasWorking) {
                this.popToast("Success", true)
                await new Promise(resolve => setTimeout(resolve, 2 * 1000))
            }
            this.show = false

            this.status = null
        },

        work(job) {
            this.wasWorking = true
            this.popToast(`Working: ${job}`)
        },
    }
})
