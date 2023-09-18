<template>
<button @click="auth">{{ isAuthed ? "Logout" : "Login" }}</button>
</template>

<script>
export default {
    name: "AuthButton",

    data() {
        return {
            isAuthed: this.$auth0.isAuthenticated
        }
    },

    methods: {
        auth() {
            if(!this.isAuthed) {
                this.$auth0.loginWithRedirect();
            } else {
                this.$auth0.logout({ 
                    logoutParams: { 
                        returnTo: window.location.origin 
                    } 
                });
            }
        }
    },
}
</script>