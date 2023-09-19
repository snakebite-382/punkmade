<template>
    <Nav :items="pages" />
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
    }
}
</script>