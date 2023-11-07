<template>
    <span class="ReportButton tw-w-fit">
        <vue-feather type="alert-triangle" @click="report" :size="iconSize || 18"/>
    </span>
</template>

<script>
import { API_ROUTE } from '../../../api';

export default {
    name: 'ReportButton',

    props: {
        mediaID: Number,
        scene: String,
        iconSize: Number
    },

    methods: {
        async report() {
            const token = await this.$auth0.getAccessTokenSilently();
            const response = await fetch(`${API_ROUTE}feed/report_media/`, {
                method: "POST",
                headers: {
                        'Content-Type': "application/json",
                        "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    mediaID: this.mediaID,
                    scene: this.scene
                })
            })

            const data = await response.json()

            if(data) {
                this.$emit("reported")
            }
        }
    }
}
</script>