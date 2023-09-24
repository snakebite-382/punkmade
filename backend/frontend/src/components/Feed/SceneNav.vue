<template>
    <Nav :items="scenes" @nav-item-click="(data) => {
        $emit('nav-item-click', data) 
    }" />
</template>

<script>
import Nav from '../Nav.vue';

export default {
    name: "SceneName",
    props: {
        scenes: Array,
    },
    components: {
        Nav
    },
}
</script>