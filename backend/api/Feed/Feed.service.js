const auth0Manager = require("../managementAPI");
const { mongo, ObjectId } = require("../mongo");
const { Post } = require("../../objects/Scene.object");

async function get_init_feed_data(req, res) {
    console.log("HIT INIT DATA")
    let data = {};

    //get the app metadata
    let userData = await auth0Manager.getUser({id: req.params.user_id})
    userData = userData.app_metadata

    data.app_metadata = userData;

    //get scene details from metadata

    let populatedList = await populateSceneIDListWithBasics(userData.Scenes);
    data.scenes = populatedList;
    
    res.send(data);
}

async function populateSceneIDListWithBasics(ids) {
    let data = [];

    await mongo.connect();
    const database = mongo.db(process.env.DATABASE);
    const collection = database.collection("Scenes");
    
    for(let i = 0; i<ids.length; i++) {
        let scene = await collection.findOne({_id: new ObjectId(ids[i])})

        let cats = [];

        scene.categories.forEach(cat => {
            cats.push(cat.name)
        })

        let basics = {
            name: scene.name,
            _id: scene._id,
            center: scene.center,
            logo: scene.logo,
            range: scene.range,
            categories: cats,
        }

        data.push(basics)
    }

    return data;
}

async function getPosts(req, res) {
    console.log("HIT POSTS")
    if(typeof req.params.scene === "string" && typeof req.params.category === "string") {
        await mongo.connect();
        const database = mongo.db(process.env.DATABASE);
        const collection = database.collection("Scenes");

        let scene = await collection.findOne({_id: new ObjectId(req.params.scene)})

        let posts = [];

        let requestedCategory = req.params.category.toLowerCase()

        for(let i = 0; i < scene.categories.length; i++) {
            let currentCategory = scene.categories[i].name.toLowerCase()
            if(currentCategory == requestedCategory) {
                posts = scene.categories[i].posts;
            }
        }

        res.send(posts.slice(req.params.indexStart, req.params.indexEnd))
    }
}

async function createPost(req, res) {
    const formData = req.body;

    console.log(formData.creator)

    const newPost = new Post(formData.creator, formData.content, formData.type)

    await mongo.connect();
    const database = mongo.db(process.env.DATABASE);
    const collection = database.collection("Scenes");

    const filter = {_id: new ObjectId(formData.scene)};

    let oldScene = await collection.findOne(filter)

    let newCategories = oldScene.categories;

    newCategories.forEach(cat => {
        if(cat.name.toLowerCase() == formData.category.toLowerCase()) {
            cat.posts.push(newPost);
        }
    })

    let result = await collection.updateOne(filter, {$set: {categories: newCategories}})

    res.send(newPost)
}

module.exports = {
    get_init_feed_data,
    getPosts,
    createPost
}