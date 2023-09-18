<template>
    <h2 class="creator">{{ post.creator.name }}</h2>
    <h3 class="content">{{ post.content }}</h3>
    <h3 class="posting">{{ post.posting ? "POSTING" : "" }}</h3>
    <h4 class="date">{{ post.timestamp }}</h4>
</template>

<script>
export default {
    name: 'Post',

    props: {
        post: Object
    }
}
</script>