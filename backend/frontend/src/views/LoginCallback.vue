<template>
</template>

<script>
export default {
    name: 'login-callback',
    data() {
        return {
            user: this.$auth0.user
        }
    }, 
    async created() {
        let token = await this.$auth0.getAccessTokenSilently();
        console.log(this.user.sub)
        let result = await fetch(`http://localhost:5000/api/users/loggedin/${this.user.sub}`, {
            headers: {
                    "Authorization": `Bearer ${token}`
                }
        })
    }
}
</script>