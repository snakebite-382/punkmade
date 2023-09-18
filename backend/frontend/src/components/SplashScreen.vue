<template>
    <h1>Welcome</h1>
    <AuthButton/>
</template>

<script>
import AuthButton from './AuthButton.vue';

export default {
    name: "SplashScreen",

    components: {
        AuthButton
    }
}
</script>