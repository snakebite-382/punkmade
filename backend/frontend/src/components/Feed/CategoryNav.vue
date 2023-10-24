<template>
    <div class="cat-nav tw-w-fitl">
        <span @click="expanded = !expanded">Categories <Chevron :Down="expanded"/></span>
        <Nav :items="categories" @nav-item-click="(data) => {
            $emit('nav-item-click', data) 
        }" :active="feedStore.currentCategory" class="tw-flex-col tw-w-fit tw-ml-4" v-show="expanded"/>
    </div>
</template>

<script>
import Nav from '../Nav.vue';
import { feedStore } from '../../stores/FeedStore';
import { mapStores } from 'pinia'
import Chevron from './Chevron.vue';

export default {
    name: "CategoryNav",

    data() {
        return {
            expanded: false,
        }
    },

    computed: {
        ...mapStores(feedStore)
    },

    components: {
        Nav,
        Chevron
    },

    props: {
        categories: Array, 
    },
    emits: ['nav-item-click'],
}
</script>