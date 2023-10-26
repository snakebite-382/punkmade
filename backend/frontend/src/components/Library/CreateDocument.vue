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
                <StyledBtn @click="prev"><Chevron :Right="false"/></StyledBtn> <StyledBtn @click="submit" class="tw-w-full tw-text-xl tw-mx-2" type="submit">Post</StyledBtn> <StyledBtn @click="next"><Chevron :Right="true"/></StyledBtn>
            </div>
        </form>
    </div>
</template>

<script>
import StyledInput from '../Reusable/StyledInput.vue';
import StyledBtn from '../Reusable/StyledBtn.vue';
import Chevron from '../Feed/Chevron.vue';
import {converter} from '../../../markdown'

export default {
    name: 'CreateDocument',

    data() {
        return {
            title: 'Title...',
            pages: ['# New post \n use **markdown** to make something worthwhile'],
            pageIndex: 0,
            MAX_PAGES: 10,
            converter,
        }
    },

    components: {
        StyledInput,
        Chevron,
        StyledBtn
    },

    methods: {
        submitEvent(e) {
            e.preventDefault();
        },

        submit(e) {
            e.preventDefault();
            if(this.pages[this.pages.length-1].length === 0) {
                if(this.pageIndex === this.pages.length-1) {
                    this.pageIndex--;
                }
                this.pages.pop()
            } 
        },

        input() {
            if(this.pages[this.pageIndex].length === 0) {
                for(let i = this.pageIndex +1; i < this.pages.length; i++) {
                    if(this.pages[i].length !== 0) {
                        this.pages[this.pageIndex] = this.pages[i];

                        for(let j = i; j < this.pages.length; j++) {
                            this.pages[j-1] = this.pages[j]
                        }

                        this.pages.pop()

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