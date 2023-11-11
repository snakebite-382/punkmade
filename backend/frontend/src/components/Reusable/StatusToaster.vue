<template>
<div id="toaster" class="tw-fixed tw-mt-4">
    <div id="inner" 
        :class="`tw-text-grey 
           tw-bg-${toasterStore.status || this.toasterStore.lastStatus} ${toasterStore.show ? 'show' : 'hide'}`"
        >
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
    bottom: 25px;
    width: 100%;
    display: flex;
    flex-direction: row;
    pointer-events: none;
}
#inner {
    padding: 15px;
    margin: auto;
    transition: opacity 1s;
}

.hide {
    opacity: 0;
}

.show {
    opacity: 1;
}
</style>
