<template>
    <Nav :items="authed ? [...pages, {path: '/profile',name: 'Profile'}] : pages" 
        class="tw-border-red tw-border-solid tw-border-4 tw-w-full tw-z-10 tw-sticky tw-text-xl md:tw-text-2xl tw-p-4 tw-justify-evenly"
    ><slot></slot></Nav>
</template>

<script>
import Nav from './Nav.vue';

export default {
    name: 'NavBar',
    components: {
        Nav
    },
    props: {
        pages: Array
    },
    data() {
        return {
            authed: this.$auth0.isAuthenticated
        }
    }
}
</script>
