import { defineStore} from "pinia";
import { API_ROUTE } from "../../api.js"

export const userStore = defineStore("user", {
    state: () => {
        return {
            name: "",
            bio: "",
            pronouns: ""
        }
    },

    actions: {
        async getInfo(tokenFn) {
            const token = await tokenFn();

            const response = await fetch(`${API_ROUTE}users/userinfo/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const data = await response.json();
            console.log(data)
            this.name = data.nickname;
            this.bio = data.bio;
            this.pronouns = data.pronouns;
        }
    }
})
