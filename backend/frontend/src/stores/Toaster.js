import { defineStore } from "pinia";

export const toaster = defineStore("toaster", {
    state: () => {
        return {
            status: null,
            show: false,
            text: "",
            wasWorking: false
        }
    },

    actions: {
        popToast(job, isSuccess = false) {
            this.show = true;

            if(isSuccess) {
                this.status = "success"
                this.text = "Success!"
                return 
            }

            this.status = job.split(':')[0];
            this.text = job
        },
    
        async cleanToaster() {
            if(this.wasWorking) {
                this.popToast("Success", true)

                await new Promise(resolve => setTimeout(resolve, 2 * 1000))
            }
            this.show = false

            setTimeout(() => this.status = null, 2 *1000)
        },

        work(job) {
            this.wasWorking = true
            this.popToast(`Working: ${job}`)
        },
    }
})