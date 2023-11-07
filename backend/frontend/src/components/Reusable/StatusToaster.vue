<template>
<div id="toaster">
    <div id="inner" :class="`tw-text-grey ${toasterStore.show ? `show tw-bg-${toasterStore.status.toLowerCase()}`: toasterStore.status ? `hide tw-bg-${toasterStore.status.toLowerCase()}` : 'hide'}`">
        <strong>{{ toasterStore.text }}</strong>
    </div>

    <!-- ANNOYING ASS FIX -->
    <div class="tw-bg-success"></div>
    <div class="tw-bg-working"></div>
    <div class="tw-bg-error"></div>
</div>
</template>

<script>
import { toaster } from '../../stores/Toaster';
import { mapStores } from 'pinia';

export default {
    name: 'StatusToaster',

    computed: {
        ...mapStores(toaster)
    }
}
</script>

<style scoped>
#toaster {
    position: absolute;
    bottom: 25px;
    width: 100vw;
    display: flex;
    flex-direction: row;
    pointer-events: none;
}
#inner {
    padding: 15px;
    margin: auto;
    transition: opacity 1s ease;
}

.hide {
    opacity: 0;
}

.show {
    opacity: 1;
}
</style>