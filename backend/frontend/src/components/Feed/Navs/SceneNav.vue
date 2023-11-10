<template>
    <div class="scene-nav tw-w-fit">
        <span @click="expanded = !expanded">Scenes <vue-feather class="tw-hidden lg:tw-inline-block" type="chevron-right" :class="`${expanded ? 'tw-rotate-90' : ' '}`"/></span>
        <Nav :items="scenes" @nav-item-click="(data) => {
            $emit('nav-item-click', data) 
        }" :active="feedStore.currentScene" class="tw-flex-col lg:tw-ml-4" v-if="expanded"/>
    </div>
</template>

<script>
import Nav from '../../Nav.vue';
import { feedStore } from '../../../stores/FeedStore';
import { mapStores } from 'pinia';

export default {
    name: "SceneName",

    data() {
        return {
            expanded: false,
        }
    },

    computed: {
        ...mapStores(feedStore)
    },

    props: {
        scenes: Array,
    },
    components: {
        Nav,
    },
}
</script>
