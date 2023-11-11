<template>
    <div class="document-preview thin-border 
        tw-m-4
        tw-min-w-[200px] lg:tw-max-w-[50vw] tw-w-[75vw] md:tw-w-fit 
        tw-min-h-[10vw] tw-h-fit 
        tw-p-4">
        <router-link 
            :to="`/library/document?docID=${doc.id}&doc=${encodeURIComponent(JSON.stringify({scene, loaded: true, ...doc}))}`" 
            class="prev-containter tw-mx-4 tw-max-w-[750px]"
        >

            <div class="title tw-mb-2 tw-text-xl">{{ doc.title }}</div>
            <div class="first-page tw-whitespace-pre-line" >
                <span class="markdown" v-html="converter.render(doc.firstPage.slice(0, 100))"></span>
                <span class="ellipses">{{ (doc.firstPage.length > 100 ? '...': '') }}</span>
            </div>
            <div class="time">
                {{ new Date(doc.timestamp).toLocaleDateString() }}
            </div>
        </router-link>
    </div>
</template>

<script>
import { converter } from '../../../markdown';

export default {
    name: 'PreviewDocument',
    props: {
        doc: Object,
        scene: String
    },

    data() {
        return {
            converter,
        }
    }
}
</script>
