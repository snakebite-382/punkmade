<template>
    <div class="dropdown">
        <span @click="expanded = !expanded">
            {{ title }}
            <vue-feather class="tw-hidden lg:tw-inline-block" type="chevron-right" :class="`${expanded ? 'tw-rotate-90' : ' '}`"/>
        </span>

        <Nav
            v-if="expanded"
            :items="items" 
            class="tw-flex-col lg:tw-ml-4"
            :active="active"
            @nav-item-click="(data) => {$emit('nav-item-click', data)}"
        />
    </div>
</template>

<script>
import Nav from "./Nav.vue"

export default {
    name: "Dropdown",

    data() {
        return {
            expanded: false
        }
    },

    components: {
        Nav,
    },

    props: {
        items: Array,
        active: String,
        title: String
    },
}
</script>
