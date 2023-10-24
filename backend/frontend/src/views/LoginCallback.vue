<template>
    <h1>logging you in...</h1>
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
        let result = await fetch(`http://localhost:5000/api/users/loggedin/`, {
            headers: {
                    "Authorization": `Bearer ${token}`
                }
        })

        let data = await result.json()

        if(data) {
            this.$router.push('/')
        }
    }
}
</script>