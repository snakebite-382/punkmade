<template>
    <div id="Onboard" class="tw-mt-4 tw-flex tw-flex-col tw-items-center tw-w-full tw-h-full">
        <div class="inner tw-w-fit" v-if="!isLoading">
            <h1 class="tw-text-xl tw-text-center tw-mb-4 underline">Onboarding</h1>
            <StyledInput type="text" placeholder="Username..." v-model="username" class="tw-mb-2 tw-w-full"/>
    
            <EditDetails :additional="{nickname: username}" :check-all="true" @success="$router.push('/scenes/')"/>
        </div>

        <FullscreenLoading v-show="isLoading"/>
    </div>
</template>

<script>
import EditDetails from '../components/User/EditDetails.vue';
import StyledBtn from '../components/Reusable/StyledBtn.vue';
import StyledInput from '../components/Reusable/StyledInput.vue';
import FullscreenLoading from '../components/Loading/Fullscreen.vue';

export default {
    name:'Onboard',

    data() {
        return {
            username: '',
            isLoading: this.$auth0.isLoading
        }
    },

    components: {
        EditDetails,
        StyledBtn,
        StyledInput,
        FullscreenLoading,
    }
}
</script>