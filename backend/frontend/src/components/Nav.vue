<template>
    <ul class="nav-bar tw-flex">
        <li v-for="(item, index) in items" :key="index" :class="(active === item.name || active === item.path ? `tw-underline tw-decoration-red tw-underline-offset-8` : ``) + 'hover:tw-text-white-hover'">
            <router-link 
                v-if="!!item.path"
               :to="item.path"
            >
                {{ item.name }}
            </router-link>
            <a href="" v-if="!item.path" @click="(e) => {handleClick(e, item)}">{{ item.name }}</a>
        </li>
        <slot class="hover:tw-text-white-hover"></slot>
    </ul>
</template>

<script>
export default {
    name: "Nav",
    props: {
        items: Array,
        active: String
    },

    methods: {
        handleClick(e, item) {
            e.preventDefault();

            this.$emit('nav-item-click', item)
        }
    },

    emits: ['nav-item-click']
}
</script>

<style scoped>
</style>