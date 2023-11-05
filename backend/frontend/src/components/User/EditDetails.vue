<template>
    <div class="edit tw-h-full">
        <form @submit="submit" class="tw-flex tw-flex-col tw-w-fit">
            <textarea 
                    name="bio" 
                    maxlength="150"
                    v-model="bio"
                    placeholder="Bio..."
                     class="tw-bg-grey thin-border tw-leading-tight tw-w-[250px] tw-h-[150px] tw-resize-none tw-outline-none tw-text-md tw-p-1"
            ></textarea>
            <span class="tw-mb-2">{{ bio.length }}/150</span>
            <StyledInput type="text" name="pronouns" placeholder="Pronouns..." v-model="pronouns" maxlength="50"/>

            <StyledBtn type="submit" class="tw-mt-2">Update</StyledBtn>
        </form>
    </div>
</template>

<script>
import StyledInput from '../Reusable/StyledInput.vue';
import StyledBtn from '../Reusable/StyledBtn.vue';

export default {
    name: "EditDetails",

    data() {
        return {
            bio: '',
            pronouns: '',
        }
    },

    props: {
        additional: Object,
        checkAll: Boolean
    },

    methods: {
        async submit(e) {
            e.preventDefault();

            let details = {
                bio: this.bio,
                pronouns: this.pronouns,
                ...this.additional
            }

            for(let key of Object.keys(details)) {
                if((key != 'bio' && key != 'pronouns') || this.checkAll)
                if(details[key].length === 0) {
                    alert(`${key} cannot be empty!`)
                }
            }

            console.log("FETCHING")

            let token = await this.$auth0.getAccessTokenSilently();

            const request = await fetch('http://localhost:5000/api/users/update_info/', {
                method: "POST",
                headers: {
                    'Content-Type': "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(details)
            })

            const data = await request.json();

            if(data) {
                this.$emit('success')
            }
        },
    },
    components: { StyledInput, StyledBtn }
}
</script>