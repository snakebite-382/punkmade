<template>
    <Nav :items="categories" @nav-item-click="(data) => {
        $emit('nav-item-click', data) 
    }" />
</template>

<script>
    import Nav from '../Nav.vue';

    export default {
        name: "CategoryNav",

        components: {
            Nav
        },

        props: {
            categories: Array, 
        },
        emits: ['nav-item-click'],
    }
</script>