<template>
    <div class="document-preview thin-border tw-m-4 tw-max-w-[15vw] tw-min-h-[10vw] tw-h-fit tw-p-4">
        <div class="title tw-mb-2 tw-text-xl">{{ doc.title }}</div>
        <div class="first-page tw-whitespace-pre-line" >
            <span class="markdown" v-html="converter.render(doc.firstPage.slice(0, 100))"></span>
            <span class="ellipses">{{ (doc.firstPage.length > 100 ? '...': '') }}</span>
        </div>
        <div class="time">
            {{ new Date(doc.timestamp).toLocaleDateString() }}
        </div>
    </div>
</template>

<script>
import { converter } from '../../../markdown';

export default {
    name: 'PreviewDocument',
    props: {
        doc: Object,
    },

    data() {
        return {
            converter,
        }
    }
}
</script>