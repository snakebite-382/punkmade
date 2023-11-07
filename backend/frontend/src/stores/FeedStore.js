import { defineStore } from "pinia"
import { socket } from '@/socket';
import {API_ROUTE} from '../../api'

const API_URL = API_ROUTE + "feed";
const TICK_RATE = 375;
const logPre = "Feed Data Store: ";

const postBatchSize = 100;

function log() {
    console.log(logPre, ...arguments);
}

function logError() {
    console.error(`ERROR at ${logPre} `, ...arguments);
}

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
            status: null,
            toasting: false,
            socketAuthed: false,
            posting: false,
            morePostsToLoad: false,
            lazyStack: [],
            docPostProgress: null,
            libraryScene: '',
            libraryDocuments: []
        }
    },

    actions: {
        throwError(error) {
            logError(error);
        },

        async setToken (tokenFn) { //very simple, just await the token function and set it as the token
            this.token = await tokenFn()
            log("Token set")
        },

        async initSocket() {
            socket.connect()

            this.socketAuthed = await socket.emitWithAck('auth', this.token);
        },

        async fetchInit() {
            log('Fetching initial data')

            const userInfo = await fetch(API_ROUTE + "users/userinfo", {
                headers: {
                    "Authorization": `Bearer ${this.token}`
                }
            })

            this.user = await userInfo.json()

            // store the user and request the initial data for the feed
            const response = await fetch(`${API_URL}/get_feed_init_data/`, {
                headers: {
                    "Authorization": `Bearer ${this.token}`
                }
            })
            const data = await response.json();

            if(!this.socketAuthed) {
                await this.initSocket();
            }

            // gives you the preferred scene and scenes
            this.preferredScene = data.preferredScene
            this.scenes = data.scenes;
            
            await this.switchScene(this.preferredScene, true)

            log("Successfully initialized data")
            return 'done'
        },

        loadMorePosts() {
            log("Loading more posts")
            let extraToFetch = postBatchSize - this.lazyStack.length;
            this.offloadLazy();
            if(extraToFetch > 0) {
                this.fetchPosts(extraToFetch, false, true)
            }

            this.fetchPosts(postBatchSize, true);
        },

        async fetchPosts(postBatchSize, pushToLazyStack = false, gradual = false) {
            let category = this.getCategory(this.currentCategory); 

            // get the current category, and base the batchsize on how many we've already fetched so we don't refetch the same post
            const start = category.posts.length;
            const end = start + postBatchSize;
            log(`Fetching posts with index [${start}, ${end}) for category ${this.currentCategory} of scene ${this.currentScene}`)
            
            if(this.socketAuthed) {
                if(gradual) {
                    let run = true;
                    for(let i = start; i < end; i++) {
                        if(!run) break;
                        let result = await socket.emitWithAck('get posts', this.currentScene, this.currentCategory, i, i+1)

                        if(result.length > 0) {
                            if(pushToLazyStack) {
                                this.lazyStack.push(result[0])
                            } else {
                                category.posts[i + start] = result[0];
                            }
                        } else {
                            run = false;
                        }
                    }

                    this.morePostsToLoad = run; // if we didn't have to stop loading at any point there's (probably) more to load
                } else { 
                    const results = await socket.emitWithAck('get posts', this.currentScene, this.currentCategory, start, end)

                    if(results) {
                        this.morePostsToLoad = results.length === postBatchSize;

                        results.forEach((post, index) => {
                            // adds the posts by index (offset by start index) to make sure the proper posts are in the right place, and overwrite any possible duplication
                            if(pushToLazyStack) {
                                this.lazyStack.push(post)
                            } else {
                                category.posts[index + start] = post;
                            }
                        })
                    } else {
                        this.morePostsToLoad = false;
                    }
                }
            } else {
                this.throwError("Socket not authenticated")
            }
            log("Fetched posts");
        },

        offloadLazy() {
            let category = this.getCategory(this.currentCategory);
            category.posts.push(...this.lazyStack)
            this.lazyStack = [];
        },

        getComment(parents) {
            let post = this.getPostById(parseInt(parents[0]));
            let target = post.post;

            let commentsToCheck = target.comments;

            for(let i = 1; i < parents.length; i++) {
                let changed = false;
                for(let j = 0; j < commentsToCheck.length; j++) {
                    if(changed) break;
                    if(commentsToCheck[j].commentID === parseInt(parents[i])) {
                        target = commentsToCheck[j]
                        commentsToCheck = target.replies;
                        changed = true;
                    }
                }
            }

            return target
        },

        removePost(postID) {
            let cat = this.getCategory(this.currentCategory)

            cat.posts.splice(this.getPostById(postID).index, 1)
        },

        async fetchReports(scene, start, end) {
            if(this.socketAuthed) {
                const results = await socket.emitWithAck('get reports', scene, start, end)

                if(!results) return this.throwError("Couldn't load reports")

                return results
            }
        },

        async fetchDocuments(batchsize, gradual=false) {
            if(!this.socketAuthed) {
                await this.initSocket();
            }

            let start = this.libraryDocuments.length
            let end = start + batchsize

            if(this.socketAuthed) {
                log('fetching docs')
                if(!gradual) {
                    let results = await socket.emitWithAck('get documents', this.libraryScene, start, end)

                    if(!results) {
                        return;
                    }

                    if(results.length === 0) {
                        return;
                    }

                    this.libraryDocuments = results;
                }
            }            
        },

        async fetchComments(parents, batchsize, gradual) {
            log(`Fetching ${batchsize} comments on target of id ${parents[parents.length -1]} with gradual=${gradual}`)

            let target = this.getComment(parents);

            let commentsToCheck = target.replies || target.comments;

            const start = commentsToCheck.length;
            const end = start + batchsize;

            if(this.socketAuthed) {
                if(gradual) {
                    let run = true;
                    for(let i = start; i < end; i++) {
                        if(!run) break;
                        let result = await socket.emitWithAck('get comments', this.currentScene, this.currentCategory, parents[parents.length - 1], i, i+1)
                        if(result.length > 0) {
                            commentsToCheck.push(result[0]);
                        } else {
                            run = false;
                        }
                    }
                } else {
                    const results = await socket.emitWithAck('get comments', this.currentScene, this.currentCategory, parents[parents.length - 1], start, end)
                
                    for(let i = 0; i < results.length; i++) {
                        commentsToCheck.push(results[i])
                    }
                }
                
            } else {
                this.throwError("Socket not authenticated")
            }
            log("Comments Fetched")
        },

        async createPost(post) {
            if(!this.posting) {
                this.posting = true;
                log("Creating post: " + JSON.stringify(post))
    
                // store that the post is posting so it shows up as such
                post.posting = true;
                post.author = this.user.nickname
                post.likes = 0;
                post.comments = [];
                post.liked = false;
                post.commentCount = 0;
                post.timestamp = Date.now();
                const postIndex = 0 // store where it is(in case new posts are added so we can still remove it)
                let posts = this.getPosts()
                posts.unshift(post); // add the new post to the posts array
    
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
                    this.throwError("Couldn't create post, rolling back optimistic update");
                    // rollback the optimistic change
                    posts.splice(postIndex, 1)
                } else {
                    log("Successfully created post")
                    // otherwise, overwrite the existing post with the one returned
                    const data = await response.json();
                    posts[postIndex].posting = false;
                    posts[postIndex].postID = data.ID;
                }
                this.posting = false;
            } else {
                this.throwError("Already Posting")
            }
        }, 

        async createDocument(title, pages) {
            this.docPostProgress = async () => {
                let doc = {
                    sceneID: this.libraryScene,
                    title,
                    pages,
                };
                const request = await fetch(API_ROUTE + 'feed/create_document/', {
                    method: "POST",
                    headers: {
                        'Content-Type': "application/json",
                        "Authorization": `Bearer ${this.token}`
                    },
                    body: JSON.stringify(doc)
                })

                let data = await request.json();

                if(data) {
                    this.libraryDocuments.push(data)
                }


                return data;
            }
        },

        async likePost(postIndex) {
            // optimistically like post
            let posts = this.getPosts();
            if(!posts[postIndex].posting) {
                log("Liking/Unliking post of index " + postIndex)
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
                    this.throwError("Couldn't like post, unrolling optimistic update");
                    // rollback the optimistic change
                    posts[postIndex].liked = !posts[postIndex].liked;
                    posts[postIndex].likes--;
                } else {
                    log("Successfully liked/unliked post")
                }
            }
        },

        async likeComment(parents) {
            let post = this.getPostById(parseInt(parents[0]))
            
            if(post.posting) {
                return
            }
            log(`Liking comment with parents ${parents.join(', ')}`)

            let comment = this.getComment(parents);
            let wasLiked = comment.liked;
            if(comment.liked) {
                comment.likes--;
                
            } else {
                comment.likes++;
            }
            
            comment.liked = !comment.liked;

            const response = await fetch(`${API_URL}/like_comment/`, {
                method: "POST",
                headers: {
                    'Content-Type': "application/json",
                    "Authorization": `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    sceneID: this.currentScene,
                    category: this.currentCategory,
                    targetID: comment.commentID,
                })
            })

            if(response.status !==200) {
                // if we didn't get the ok
                this.throwError("Couldn't like comment, unrolling optimistic update");
                // rollback the optimistic change
       
                comment.liked = wasLiked;
                if(wasLiked) {
                    comment.likes++;
                } else {
                    comment.likes--;
                }
            } else {
                log("Successfully liked/unliked comment")
                const data = await response.json(); // returns true if already liked
                console.log(data, comment)
            }
        },

        getPostById(id) {
            let result;
            this.getPosts().forEach((post, index) => {
                if(post.postID === id) {
                    result = {
                        post,
                        index
                    }
                }
            })

            return result
        },

        async createComment(content, parents) {
            let post = this.getPostById(parseInt(parents[0]));
            if(!post.posting) {
                let postIndex = post.index;
                post = post.post;

                log(`Commenting: ${content} on post of index: ${postIndex}`)

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

                if(parents.length === 1) {
                    this.getPosts()[postIndex].commentCount++;
                }

                let success = await response.json()
                if(success) {
                    await this.fetchComments(parents, 1, true);
                } else {
                    this.throwError("Couldn't create comment")   
                }
                this.status = null
            }
        },

        initCategories(scene) {
            // just goes through the categories and converts it from a list of names to a name posts pair
            log("Initializing categories for scene: " + scene)
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
            log("Switching to category " + categoryName)
            this.currentCategory = categoryName;

            if(asynchronous) {
                this.fetchPosts(postBatchSize, false, true)
            } else {
                await this.fetchPosts(postBatchSize)
            }

            this.fetchPosts(postBatchSize, true)
        },

        async switchScene(name, asynchronous = false) {
            log("Switching to scene " + name);

            this.currentScene = name;

            this.initCategories(this.currentScene);

            await this.switchCategory('general', asynchronous);
            log("Successfully switched scenes")
        },

        setupCommentParents(postID = this.newCommentParents[0], parents = this.newCommentParents.slice(1)) {
            let newParents = [postID].concat(parents)
            log("Setting up comment parents " + JSON.stringify(newParents))
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