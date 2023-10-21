import { defineStore } from "pinia"
import { state, socket } from '@/socket';

const API_URL = "http://localhost:5000/api/feed";
const logPre = "Feed Data Store: ";

const postBatchSize = 100;

export const feedStore = defineStore("feed", {
    state: () => {
        return {
            preferredScene: '',
            scenes: [],
            currentScene: '', 
            currentCategory: "",
            token: '',
            user: {},
            initialized: false,
            newCommentParents: [''],
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
            const response = await fetch(`${API_URL}/get_feed_init_data/`, {
                headers: {
                    "Authorization": `Bearer ${this.token}`
                }
            })
            const data = await response.json();

            // gives you the preferred scene and scenes
            this.preferredScene = data.preferredScene
            this.scenes = data.scenes;
            
            await this.switchScene(this.preferredScene, true)

            console.log(logPre + "Successfully initialized data")
            return 'done'
        },

        async fetchPosts(postBatchSize, gradual = false) {
            let category = this.getCategory(this.currentCategory); 

            // get the current category, and base the batchsize on how many we've already fetched so we don't refetch the same post
            const start = category.posts.length;
            const end = start + postBatchSize;
            console.log(logPre + `Fetching posts with index [${start}, ${end}) for category ${this.currentCategory} of scene ${this.currentScene}`)
            
            socket.connect()

            const authed = await socket.emitWithAck('auth', this.token);
            
            if(authed) {
                if(gradual) {
                    let run = true;
                    for(let i = start; i < end; i++) {
                        if(!run) break;
                        let result = await socket.emitWithAck('get posts', this.currentScene, this.currentCategory, i, i+1)
                        if(result.length > 0) {
                            category.posts[i + start] = result[0];
                        } else {
                            run = false;
                        }
                    }
                } else {
                    const results = await socket.emitWithAck('get posts', this.currentScene, this.currentCategory, start, end)

                    results.forEach((post, index) => {
                        // adds the posts by index (offset by start index) to make sure the proper posts are in the right place, and overwrite any possible duplication
                        category.posts[index + start] = post;
                    })
                }
            } else {
                console.log(logPre + "SOCKET AUTH ERROR FETCHING POSTS")
            }

            socket.disconnect()
            console.log(logPre + "Fetched posts")
        },

        async createPost(post) {
            console.log(logPre + "Creating post: " + JSON.stringify(post))

            // store that the post is posting so it shows up as such
            post.posting = true;
            post.likes = [];
            post.comments = [];
            const postIndex = 0 // store where it is(in case new posts are added so we can still remove it)
            this.getPosts().unshift(post); // add the new post to the posts array

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

        async likePost(postIndex, postID) {
            console.log(logPre + "Liking/Unliking post of index " + postIndex)

            // optimistically like post
            let category = this.getCategory(this.currentCategory)
            let posts = this.getPosts()
            posts[postIndex].likes += posts[postIndex].liked ? -1 : 1
            posts[postIndex].liked = !posts[postIndex].liked;
            
            // send the request to update posts liked (use post id NOT index to avoid errors with out of sync client)
            const response = await fetch(`${API_URL}/like_post/`, {
                method: "POST",
                headers: {
                    'Content-Type': "application/json",
                    "Authorization": `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    sceneID: this.currentScene,
                    category: this.currentCategory,
                    postID: posts[postIndex].postID,
                })
            })

            if(response.status !==200) {
                // if we didn't get the ok
                console.log(logPre + "Error liking post, unrolling optimistic update, status: " + response.status)
                // rollback the optimistic change
                posts[postIndex].liked = !posts[postIndex].liked;
                posts[postIndex].likes--;
            } else {
                console.log(logPre + "Successfully liked/unliked post")
                // otherwise, overwrite the existing post with the one returned
                const data = await response.json()
                posts[postIndex] = data
            }
        },

        getPostById(id) {
            let result;
            this.getPosts().forEach((post, index) => {
                if(post.id === id) {
                    result = {
                        post,
                        index
                    }
                }
            })

            return result
        },

        async createComment(content, parents) {
            let post = this.getPostById(parents[0]);
            let postIndex = this.getPosts().indexOf(post);

            console.log(logPre + `Commenting: ${content} on post of index: ${postIndex}`)

            let response = await fetch(`${API_URL}/create_comment/`, {
                method: "POST",
                headers: {
                    'Content-Type': "application/json",
                    "Authorization": `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    scene: this.currentScene,
                    category: this.currentCategory,
                    parent: parents[parents.length-1],
                    root: parents[0],
                    comment: content
                })
            })

            let data = await response.json();

            this.getPosts()[postIndex] = data;
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

        async switchCategory(categoryName, asynchronous = false) {
            console.log(logPre + "Switching to category " + categoryName)
            this.currentCategory = categoryName;

            if(asynchronous) {
                this.fetchPosts(100, true)
            } else {
                await this.fetchPosts(100)
            }
        },

        async switchScene(name, asynchronous = false) {
            console.log(logPre + "Switching to scene " + name);

            this.currentScene = name;

            this.initCategories(this.currentScene);

            await this.switchCategory('general', asynchronous);
            console.log(logPre + "Successfully switched scenes")
        },

        setupCommentParents(postID = this.newCommentParents[0], parents = this.newCommentParents.slice(1)) {
            let newParents = [postID].concat(parents)
            console.log(logPre + "Setting up comment parents " + JSON.stringify(newParents))
            this.newCommentParents = newParents
        },

        // yeah these should be getters, no I won't do that cuz I moved them there and got errors and I don't like that :(

        getScene(name) { // gets the scene by id
            let scene;

            for(let i = 0; i < this.scenes.length; i++) {
                if(this.scenes[i].name === name) {
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