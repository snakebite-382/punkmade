<template>
    <vue-feather @click="$emit('toggle-comments')" type="message-circle" :size="iconSize || 18" />
</template>

<script>
export default {
    name: "CommentButton",
    props: {
        fill: String,
        outline: String,
        iconSize: Number
    }
}
</script>
