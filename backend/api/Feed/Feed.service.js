const auth0Manager = require("../managementAPI");
const { mongo, ObjectId } = require("../mongo");
const { Post, Like, Comment } = require("../../objects/Scene.object");

async function get_init_feed_data(req, res) {
    let data = {};

    //get the app metadata
    let userData = await auth0Manager.getUser({id: req.params.user_id})
    userData = userData.app_metadata

    // add to returned data
    data.app_metadata = userData;

    //get scene details from metadata
    let populatedList = await populateSceneIDListWithBasics(userData.Scenes);
    // store on return data
    data.scenes = populatedList;
    
    // send it
    res.send(data);
}

async function populateSceneIDListWithBasics(ids) {
    let data = [];

    await mongo.connect();
    const database = mongo.db(process.env.DATABASE);
    const collection = database.collection("Scenes");
    
    for(let i = 0; i<ids.length; i++) { // for each id in the passed in array
        // get the scene
        let scene = await collection.findOne({_id: new ObjectId(ids[i])})

        let cats = [];

        scene.categories.forEach(cat => { // add just the category name (posts is unnecessary and long)
            cats.push(cat.name)
        })

        let basics = { // set a basics object with just the necessary information
            name: scene.name,
            _id: scene._id,
            center: scene.center,
            logo: scene.logo,
            range: scene.range,
            categories: cats,
        }

        data.push(basics) // add it to the returned array
    }

    return data; // return back the list of populated scenes
}

async function getPosts(req, res) {
    if(typeof req.params.scene === "string" && typeof req.params.category === "string") { // if params are valid
        await mongo.connect();
        const database = mongo.db(process.env.DATABASE);
        const collection = database.collection("Scenes");

        let scene = await collection.findOne({_id: new ObjectId(req.params.scene)}) // find requested scene

        let posts = [];

        let requestedCategory = req.params.category.toLowerCase()

        for(let i = 0; i < scene.categories.length; i++) { //for each category
            let currentCategory = scene.categories[i].name.toLowerCase()
            if(currentCategory == requestedCategory) { // if the category is correct
                posts = scene.categories[i].posts; // get the posts 
            }
        }

        res.send(posts.slice(req.params.indexStart, req.params.indexEnd)) // return only the requested slice
    }
}

// all these create functions use almost exactly the same code just to different depths, so I should turn this into 
// a series of functions to edit things within a scene, category, or post

async function createPost(req, res) {
    const formData = req.body;
    const newPost = new Post(formData.creator, formData.content, formData.type) // create a new post

    await mongo.connect();
    const database = mongo.db(process.env.DATABASE);
    const collection = database.collection("Scenes");

    const filter = {_id: new ObjectId(formData.scene)};

    let oldScene = await collection.findOne(filter) // get the old scene

    let newCategories = oldScene.categories;

    newCategories.forEach(cat => { // for each category in the scene
        if(cat.name.toLowerCase() == formData.category.toLowerCase()) { // if it's the right one
            cat.posts.unshift(newPost); // add the post
        }
    })

    let result = await collection.updateOne(filter, {$set: {categories: newCategories}}) // update the scene

    res.send(newPost) // send the new post
}

async function likePost(req, res) {
    await mongo.connect()
    const database = mongo.db(process.env.DATABASE);
    const collection = database.collection("Scenes");

    const filter = {_id: new ObjectId(req.body.sceneID)};

    let oldScene = await collection.findOne(filter);

    let newCategories = oldScene.categories;

    let edittedPost;

    newCategories.forEach(cat => { // for each category in the scene
        if(cat.name.toLowerCase() == req.body.category.toLowerCase()) { // if it's the right one
            cat.posts.forEach(post => { // got through each post
                if(post.id === req.body.postID) { // if its the selected post
                    let unliking = false;
                    let existingIndex = -1;

                    post.likes.forEach(like => { // check if the user already has a like for this post
                        if(like.likedBy === req.body.userID) {
                            unliking = true; // if they do we're unliking
                        }
                    })

                    if(!unliking) {
                        let like = new Like(req.body.userID) // create a new like
                        post.likes.push(like) // and add it to the post likes
                    } else {
                        post.likes.splice(existingIndex, 1); //remove the like if unliking
                    }

                    edittedPost = post;
                }
            })
        }
    })

    let result = await collection.updateOne(filter, {$set: {categories: newCategories}})

    res.send(edittedPost)
}

async function createComment(req, res) {
    console.log(req.body)
    await mongo.connect()
    const database = mongo.db(process.env.DATABASE);
    const collection = database.collection("Scenes");

    const filter = {_id: new ObjectId(req.body.sceneID)};

    let oldScene = await collection.findOne(filter);

    let newCategories = oldScene.categories;

    let edittedPost;

    newCategories.forEach(cat => { // for each category in the scene
        if(cat.name.toLowerCase() == req.body.category.toLowerCase()) { // if it's the right one
            cat.posts.forEach(post => { // got through each post
                if(post.id === req.body.parents[0]) { // if its the selected post
                    if(req.body.parents.length === 1) {// if we're just selecting the post
                        let newComment = new Comment(req.body.comment.creator, req.body.comment.content)
                        post.comments.unshift(newComment);
                    } else { // uh oh its a reply fuck shit time

                    }

                    edittedPost = post;
                }
            })
        }
    })

    let result = await collection.updateOne(filter, {$set: {categories: newCategories}})

    res.send(edittedPost)
}

module.exports = {
    get_init_feed_data,
    getPosts,
    createPost,
    likePost,
    createComment
}