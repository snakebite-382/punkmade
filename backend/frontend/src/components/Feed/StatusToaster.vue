<template>
<div id="toaster">
    <div id="inner" :class="`${feedStore.status != null ? `show ${feedStore.status.split(':')[0]}`: 'hide'}`">
        {{ feedStore.status }}
    </div>
</div>
</template>

<script>
import { feedStore } from '../../stores/FeedStore';
import { mapStores } from 'pinia';

export default {
    name: 'StatusToaster',

    computed: {
        ...mapStores(feedStore)
    }
}
</script>

<style scoped>
#toaster {
    position: -webkit-sticky;
    position: sticky;
    bottom: 25px;
    width: 100vw;
    display: flex;
    flex-direction: row;
    pointer-events: none;
}
#inner {
    padding: 15px;
    border: 5px solid;
    border-radius: 15px;
    margin: auto;
    opacity: 0;
}

.show {
    opacity: 1 !important;
}

.Error {
    background-color: rgb(230, 55, 55);
    border-color: rgb(137, 39, 39) !important;
}

.Working {
    background-color: rgb(222, 191, 19);
    border-color: rgb(162, 140, 13) !important;
}
</style>