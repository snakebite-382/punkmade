<template>
    <router-link :to="`/profile?user=${authID}`" class="creator tw-text-xl tw-text-center">
        {{ name }}
    </router-link>
</template>

<script>
export default {
    name: "UserLink",

    props: {
        authID: String,
        name: String
    },

    created() {

    }
}
</script>
