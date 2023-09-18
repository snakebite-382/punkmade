import { defineStore } from "pinia"

const API_URL = "http://localhost:5000/api/feed";
const logPre = "Feed Data Store: "

export const feedStore = defineStore("feed", {
    state: () => {
        return {
            app_metadata: {},
            scenes: [],
            currentScene: {},
            currentCategory: "general",
            categories: [{
                name: "general",
                posts: []
            }],
            token: '',
            userID: '',
            initialized: false,
        }
    },

    actions: {
        async setToken (tokenFn) {
            this.token = await tokenFn()
            console.log(logPre + "Token set")
        },

        async fetchInit(user) {
            console.log(logPre + 'Fetching initial data')
            this.user = user
            const response = await fetch(`${API_URL}/get_feed_init_data/${this.user.sub}`, {
                headers: {
                    "Authorization": `Bearer ${this.token}`
                }
            })
            const data = await response.json();

            this.app_metadata = data.app_metadata;
            this.scenes = data.scenes
            this.currentScene = this.getScene(data.app_metadata.preferredScene);

            console.log(logPre + "Successfully initialized data")
        },

        async fetchPosts(batchSize) {
            let category = this.getCategory(this.currentCategory);
            
            const start = category.posts.length;
            const end = start + batchSize;
            console.log(logPre + `Fetching posts with index [${start}, ${end})`)
            const response = await fetch(`${API_URL}/get_posts/${this.currentScene._id}/${this.currentCategory}/${start}/${end}`, {
                headers: {
                    "Authorization": `Bearer ${this.token}`
                }
            })

            const data = await response.json();

            category.posts = category.posts.concat(data)
            console.log(logPre + "Fetched posts")
        },

        async createPost(post) {
            console.log(logPre + "Creating post: " + JSON.stringify(post))

            post.posting = true;
            const postIndex = this.posts.length
            this.posts.push(post);

            post.scene = this.currentScene._id;
            post.category = this.currentCategory

            const response = await fetch(`${API_URL}/create_post/`, {
                method: "POST",
                headers: {
                    'Content-Type': "application/json",
                    "Authorization": `Bearer ${this.token}`
                },
                body: JSON.stringify(post)
            });

            if(response.status !==200) {
                console.log(logPre + "Error creating post, unrolling optimistic update, status: " + response.status)
                this.posts.splice(postIndex, 1)
            } else {
                console.log(logPre + "Successfully created post")
                const data = await response.json()
                this.posts[postIndex] = data
            }
        }, 

        getScene(id) {
            let scene;

            for(let i = 0; i < this.scenes.length; i++) {
                if(this.scenes[i]._id === id) {
                    scene = this.scenes[i];
                }
            }

            return scene
        },

        getCategory(name) {
            for(let i= 0; i < this.categories.length; i++) {
                if(this.categories[i].name.localeCompare(name) === 0) {
                    return this.categories[i]
                }
            }
        },

        getPosts() {
            return this.getCategory(this.currentCategory).posts
        }
    }
})