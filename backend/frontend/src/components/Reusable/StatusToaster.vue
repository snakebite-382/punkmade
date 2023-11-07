<template>
<div id="toaster">
    <div id="inner" :class="`${toasterStore.status != null ? `show tw-bg-${toasterStore.status.toLowerCase()} tw-text-grey`: 'hide'}`">
        <strong>{{ toasterStore.text }}</strong>
    </div>
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
    border: 5px solid;
    margin: auto;
}

.hide {
    opacity: 0;
}

.show {
    opacity: 1;
}
</style>