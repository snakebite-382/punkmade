<template>
    <div class="comment">
        {{ comment.creator.name }}: {{ comment.content }}
    </div>
</template>

<script>
export default {
    name: "Comment",
    props: {
        comment: Object,
        depth: Number,
        maxDepth: Number
    }
}
</script>