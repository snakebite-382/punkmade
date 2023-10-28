<template>
    <div class="cat-nav tw-w-fitl">
        <span @click="expanded = !expanded">Categories <vue-feather type="chevron-right" :class="`${expanded ? 'tw-rotate-90' : ' '}`"/></span>
        <Nav :items="categories" @nav-item-click="(data) => {
            $emit('nav-item-click', data) 
        }" :active="feedStore.currentCategory" class="tw-flex-col tw-w-fit tw-ml-4" v-show="expanded"/>
    </div>
</template>

<script>
import Nav from '../Nav.vue';
import { feedStore } from '../../stores/FeedStore';
import { mapStores } from 'pinia'

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
    },

    props: {
        categories: Array, 
    },
    emits: ['nav-item-click'],
}
</script>