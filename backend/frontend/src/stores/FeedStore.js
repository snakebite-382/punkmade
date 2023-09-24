import { defineStore } from "pinia"

const API_URL = "http://localhost:5000/api/feed";
const logPre = "Feed Data Store: ";

const postBatchSize = 100;

export const feedStore = defineStore("feed", {
    state: () => {
        return {
            app_metadata: {},
            scenes: [],
            currentScene: '', 
            currentCategory: "",
            token: '',
            userID: '',
            initialized: false,
        }
    },

    actions: {
        async setToken (tokenFn) { //very simple, just await the token function and set it as the token
            this.token = await tokenFn()
            console.log(logPre + "Token set")
        },

        async fetchInit(user) {
            console.log(logPre + 'Fetching initial data')
            this.user = user

            // store the user and request the initial data for the feed
            const response = await fetch(`${API_URL}/get_feed_init_data/${this.user.sub}`, {
                headers: {
                    "Authorization": `Bearer ${this.token}`
                }
            })
            const data = await response.json();

            // gives you the app metadata and scenes
            this.app_metadata = data.app_metadata;
            this.scenes = data.scenes;
            
            await this.switchScene(this.app_metadata.preferredScene)

            console.log(logPre + "Successfully initialized data")
            return 'done'
        },

        async fetchPosts(postBatchSize) {
            let category = this.getCategory(this.currentCategory); 

            // get the current category, and base the batchsize on how many we've already fetched so we don't refetch the same post
            const start = category.posts.length;
            const end = start + postBatchSize;
            console.log(logPre + `Fetching posts with index [${start}, ${end}) for category ${this.currentCategory} of scene ${this.currentScene}`)
            const response = await fetch(`${API_URL}/get_posts/${this.currentScene}/${encodeURIComponent(this.currentCategory)}/${start}/${end}`, {
                headers: {
                    "Authorization": `Bearer ${this.token}`
                }
            })

            const data = await response.json();

            // append all the new posts
            data.forEach((post, index) => {
                // adds the posts by index (offset by start index) to make sure the proper posts are in the right place, and overwrite any possible duplications
                category.posts[index + start] = post;
            })
            console.log(logPre + "Fetched posts")
        },

        async createPost(post) {
            console.log(logPre + "Creating post: " + JSON.stringify(post))

            // store that the post is posting so it shows up as such
            post.posting = true;
            const postIndex = this.getPosts().length // store where it is(in case new posts are added so we can still remove it)
            this.getPosts().push(post); // add the new post to the posts array

            post.scene = this.currentScene; // store more post data
            post.category = this.currentCategory

            const response = await fetch(`${API_URL}/create_post/`, { // send it 
                method: "POST",
                headers: {
                    'Content-Type': "application/json",
                    "Authorization": `Bearer ${this.token}`
                },
                body: JSON.stringify(post)
            });

            if(response.status !==200) {
                // if we didn't get the ok
                console.log(logPre + "Error creating post, unrolling optimistic update, status: " + response.status)
                // rollback the optimistic change
                this.getPosts().splice(postIndex, 1)
            } else {
                console.log(logPre + "Successfully created post")
                // otherwise, overwrite the existing post with the one returned
                const data = await response.json()
                this.getPosts()[postIndex] = data
            }
        }, 

        initCategories(scene) {
            // just goes through the categories and converts it from a list of names to a name posts pair
            console.log(logPre + "Initializing categories for scene: " + scene)
            let categories = []
            let target = this.getScene(scene)

            if(typeof target.categories[0] == 'string') {
                for(let i = 0; i < target.categories.length; i++) {
                    categories.push({
                        name: (target.categories[i]).toLowerCase(),
                        posts: []
                    })
                }
    
                target.categories = categories;
            }
        },

        async switchCategory(categoryName) {
            console.log(logPre + "Switching to category " + categoryName)
            this.currentCategory = categoryName;

            await this.fetchPosts(100)
        },

        async switchScene(id) {
            console.log(logPre + "Switching to scene " + id);

            this.currentScene = id;

            this.initCategories(this.currentScene);

            await this.switchCategory('general');
            console.log(logPre + "Successfully switched scenes")
        },

        // yeah these should be getters, no I won't do that cuz I moved them there and got errors and I don't like that :(

        getScene(id) { // gets the scene by id
            let scene;

            for(let i = 0; i < this.scenes.length; i++) {
                if(this.scenes[i]._id === id) {
                    scene = this.scenes[i];
                }
            }

            return scene
        },

        getCategory(name) { // gets category by name
            let categories = this.getScene(this.currentScene).categories;
            for(let i= 0; i < categories.length; i++) {
                if(categories[i].name.localeCompare(name) === 0) {
                    return categories[i]
                }
            }
        },

        getPosts() { // gets posts of current category
            return this.getCategory(this.currentCategory).posts
        }
    }
})