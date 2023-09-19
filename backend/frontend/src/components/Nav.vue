<template>
    <ul class="nav-bar">
        <li v-for="(item, index) in items" :key="index">
            <router-link 
                v-if="!!item.path"
               :to="item.path"
            >
                {{ item.name }}
            </router-link>
            <a href="" v-if="!item.path" @click="(e) => {handleClick(e, item)}">{{ item.name }}</a>
        </li>
    </ul>
</template>

<script>
export default {
    name: "Nav",
    props: {
        items: Array
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