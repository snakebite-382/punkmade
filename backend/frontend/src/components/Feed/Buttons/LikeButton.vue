<template>
    <vue-feather @click="$emit('post-liked')" type="heart" :size="iconSize || 18" :fill="fill || none"></vue-feather>
</template>

<script>
export default {
    name: 'LikeButton',
    props: {
        fill: String,
        iconSize: Number
    },
    emits: ["post-liked"]
}
</script>
