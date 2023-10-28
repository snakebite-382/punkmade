<template>
    <div id="Create">
        <form :onsubmit="submitEvent" class="tw-mx-auto tw-w-fit tw-flex tw-flex-col tw-items-center tw-mt-4">
            <StyledInput type="text" v-model="title" name="title" class="tw-text-center tw-text-xl tw-mb-2 tw-w-full" />
            <div class="editor tw-flex">
                <textarea 
                    @input="input"
                    name="content" 
                    cols="auto"
                    v-model="pages[pageIndex]"
                    maxlength="1500"
                     class="tw-bg-grey thin-border tw-leading-tight tw-w-[35vw] tw-h-[75vh] tw-resize-y tw-outline-none tw-text-lg tw-mb-2 tw-p-2"
                ></textarea>
                <div class="preview markdown tw-p-2 tw-w-[35vw] thin-border tw-ml-2 tw-min-h-[75vh] tw-h-full" v-html="converter.render(pages[pageIndex])">
                </div>
            </div>
            <div class="display">
                {{ pages[pageIndex].length }}/1500 characters | page {{ pageIndex + 1 }}/{{ MAX_PAGES }}
            </div>

            <div class="option-bar tw-flex tw-justify-between tw-w-full tw-mt-2">
                <StyledBtn @click="prev"><vue-feather type="chevron-right" class="tw-rotate-180 tw-p-0.5"/></StyledBtn>
                <StyledBtn @click="submit" class="tw-w-full tw-text-xl tw-mx-2" type="submit">Post</StyledBtn>
                <StyledBtn @click="next"><vue-feather type="chevron-right" class="tw-p-0.5"/></StyledBtn>
            </div>
        </form>
    </div>
</template>

<script>
import StyledInput from '../Reusable/StyledInput.vue';
import StyledBtn from '../Reusable/StyledBtn.vue';
import {converter} from '../../../markdown'
import { feedStore } from '../../stores/FeedStore';
import { mapStores } from 'pinia';

const defaultFirstPage = '# New post \n use **markdown** to make something worthwhile'

export default {
    name: 'CreateDocument',

    data() {
        return {
            title: 'Title...',
            pages: [defaultFirstPage],
            pageIndex: 0,
            MAX_PAGES: 10,
            converter,
        }
    },

    components: {
        StyledInput,
        StyledBtn
    },

    computed: {
        ...mapStores(feedStore)
    },

    methods: {
        submitEvent(e) {
            e.preventDefault();
        },

        async submit(e) {
            console.log("submit")
            e.preventDefault();
            // if the last page is empty
            if(this.pages[this.pages.length-1].length === 0) {
                // move back one and remove the empty last page
                if(this.pageIndex === this.pages.length-1) {
                    this.pageIndex--;
                }
                this.pages.pop()
            } 

            let totalChars = 0;

            for(let page of this.pages) {
                totalChars += page.length;
            }

            if(totalChars <= 500) {
                alert("This document is too short, it can fit in a post, the library is made for larger informational docs");
                return
            }

            this.$emit('submit-form', {pages: this.pages, title: this.title}) 

            let success = await this.feedStore.docPostProgress();

            if(success) {
                this.pages = [defaultFirstPage]
                this.pageIndex = 0;
            }
        },

        input() {
            if(this.pages[this.pageIndex].length === 0) {
                // checks If the page length is 0, if it is and theres more pages with text the next page with text becomes the current page
                for(let i = this.pageIndex +1; i < this.pages.length; i++) {
                    if(this.pages[i].length !== 0) {
                        this.pages[this.pageIndex] = this.pages[i];

                        for(let j = i; j < this.pages.length; j++) { // more everything up
                            this.pages[j-1] = this.pages[j]
                        }

                        this.pages.pop() // remove last page 

                        return
                    }
                }
            }
        },

        prev() {
            if(this.pageIndex > 0) {
                this.pageIndex--;
            }
        },

        next() {
            if(this.pageIndex < this.MAX_PAGES-1) {
                if(this.pages[this.pageIndex].length === 0) {
                    alert("All pages must have content");
                    return
                }

                this.pageIndex++;

                if(!this.pages[this.pageIndex]) {
                    this.pages[this.pageIndex] = ''
                }
            }
        }
    }
}
</script>