<template>
    <h1>logging you in...</h1>
</template>

<script>
import { navRoutes } from '../router';
import { API_ROUTE } from '../../api';

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
        let result = await fetch(`${API_ROUTE}users/loggedin/`, {
            headers: {
                    "Authorization": `Bearer ${token}`
                }
        })

        let data = await result.json();

        if(data) {
            this.$router.push('/')
        } else {
            this.$router.push('/onboard')
        }
    }
}
</script>