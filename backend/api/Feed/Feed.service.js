const {dbDriver} = require('../db.js')
const {postNodeToPostObject} = require('../Websockets.js')

async function get_init_feed_data(req, res) {
    let userID = req.auth.payload.sub

    // send it
    const {records : prefSceneRels} = await dbDriver.executeQuery(
        'MATCH (:USER {authID: $authID})-[:PREFERRED_SCENE]->(scene:SCENE) RETURN scene.name as preferredScene',
        {
            authID: userID,
        },
        {database: 'neo4j'}
    )

    let preferredScene = prefSceneRels[0].get('preferredScene');

    const {records: sceneRecords} = await dbDriver.executeQuery(
        `MATCH (:USER {authID: $authID})-[:PART_OF]->(scene:SCENE)-[:HAS_CATEGORY]->(category:CATEGORY) 
        RETURN scene.name as name, scene.center as center, scene.range as range, COLLECT(category)`,
        {
            authID: userID
        },
        {database: 'neo4j'}
    )

    let scenes = [];

    sceneRecords.forEach(scene => {
        let categoryNodes = scene.get('COLLECT(category)');

        let categories = [];

        categoryNodes.forEach(cat => {
            categories.push({
                name: cat.properties.name,
                posts: []
            })
        })

        scenes.push({
            name: scene.get('name'),
            center: scene.get('center'),
            range: scene.get('range'),
            categories,
        })
        
    })

    let data = {
        preferredScene,
        scenes,
    }

    res.send(data);
}

async function createPost(req, res) {
    const formData = req.body;
    // const newPost = new Post(formData.creator, formData.content, formData.type) // create a new post

    let userID = req.auth.payload.sub

    const {records : postRecords} = await dbDriver.executeQuery(
        `MATCH (user:USER {authID: $authID})-[:PART_OF]->(:SCENE {name: $sceneName})-[:HAS_CATEGORY]->(category:CATEGORY {name: $categoryName})
        CREATE (user)-[:POSTED]->(post:POST {content: $content, type: $type, timestamp: $timestamp})-[:POSTED_ON]->(category)
        RETURN ID(post) as postID`,
        {
            authID: userID,
            sceneName: formData.scene,
            categoryName: formData.category,
            content: formData.content,
            type: formData.type,
            timestamp: Date.now(),
        },
        {database: 'neo4j'}
    )

    let newPost = postRecords[0].get('postID').toNumber()

    res.send({ID: newPost}) // send the new post
}

async function likePost(req, res) {
    let formData = req.body;
    let userID = req.auth.payload.sub;

    let {records: likedRecords} = await dbDriver.executeQuery(
        `
        MATCH (post:POST)
        WHERE ID(post) = $postID
        MATCH (user:USER {authID: $authID})
        MATCH (user)-[userLiked:LIKED]->(post)
        RETURN COUNT(userLiked) as userLiked`,
        {
            authID: userID,
            postID: formData.postID,
        },
        {database: 'neo4j'}
    )

    let alreadyLiked = likedRecords[0].get('userLiked').toNumber() === 1 ? true : false;

    let createQuery = `CREATE (user)-[:LIKED]->(post)`

    let deleteQuery = `DELETE like`

    let {records: postRecords} = await dbDriver.executeQuery(
        `MATCH (post:POST)
        WHERE ID(post) = $postID
        MATCH (user:USER {authID: $authID})
        OPTIONAL MATCH (:USER)-[like:LIKED]->(post)
        OPTIONAL MATCH (user)-[userLiked:LIKED]->(post)
        ${!alreadyLiked ? createQuery : deleteQuery}
        `,
        {
            authID: userID,
            postID: formData.postID,
        },
        {database: 'neo4j'}
    )

    res.send(true)
}

async function likeComment(req, res) {
    let formData = req.body;
    let userID = req.auth.payload.sub;

    let {records: likedRecords} = await dbDriver.executeQuery(
        `
        MATCH (comment:COMMENT)
        WHERE ID(comment) = $targetID
        MATCH (user:USER {authID: $authID})
        MATCH (user)-[userLiked:LIKED]->(comment)
        RETURN COUNT(userLiked) as userLiked`,
        {
            authID: userID,
            targetID: formData.targetID,
        },
        {database: 'neo4j'}
    )

    let alreadyLiked = likedRecords[0].get('userLiked').toNumber() === 1 ? true : false;

    let createQuery = `CREATE (user)-[:LIKED]->(comment)`

    let deleteQuery = `DELETE like`

    let {records: postRecords} = await dbDriver.executeQuery(
        `MATCH (comment:COMMENT)
        WHERE ID(comment) = $targetID
        MATCH (user:USER {authID: $authID})
        OPTIONAL MATCH (:USER)-[like:LIKED]->(comment)
        OPTIONAL MATCH (user)-[userLiked:LIKED]->(comment)
        ${!alreadyLiked ? createQuery : deleteQuery}
        `,
        {
            authID: userID,
            targetID: formData.targetID,
        },
        {database: 'neo4j'}
    )

    res.send(true)
}

async function createComment(req, res) {
    let formData = req.body;
    formData.root = parseInt(formData.root);
    formData.parent = parseFloat(formData.parent)
    let userID = req.auth.payload.sub;
    let relType = formData.root === formData.parent ? 'COMMENTED_ON' : 'REPLIED_TO';

    await dbDriver.executeQuery(
        `MATCH (parent:POST|COMMENT)
        WHERE ID(parent) = $parentID
        MATCH (user:USER)-[:PART_OF]->(:SCENE {name: $sceneName})-[:HAS_CATEGORY]->(:CATEGORY {name: $categoryName})<-[:POSTED_ON]-(root:POST)
        WHERE ID(root) = $rootID
        CREATE (user)-[:COMMENTED]->(comment:COMMENT {content: $content, timestamp: $timestamp})-[:${relType}]->(parent)`,
        {
            parentID: formData.parent,
            rootID: formData.root,
            content: formData.comment,
            categoryName: formData.category,
            sceneName: formData.scene,
            timestamp: Date.now(),
        },
        {database: 'neo4j'}
    )

    let {records: postRecords} = await dbDriver.executeQuery(
        `MATCH (post:POST)
        WHERE ID(post) = $postID
        MATCH (user:USER {authID: $authID})
        OPTIONAL MATCH (:COMMENT)-[commentCount:COMMENTED_ON]->(post)
        OPTIONAL MATCH (:USER)-[like:LIKED]->(post)
        OPTIONAL MATCH (user)-[userLiked:LIKED]->(post)
        RETURN post.type as type, post.timestamp as timestamp, COLLECT(user), COUNT(like) as likes, COUNT(userLiked) as liked, ID(post) as postID, COUNT(commentCount) as commentCount
        `,
        {
            authID: userID,
            postID: formData.root,
        },
        {database: 'neo4j'}
    )

    let newPost = postNodeToPostObject(postRecords[0], postRecords[0].get('COLLECT(user)')[0].properties.name)

    res.send(newPost)
}

module.exports = {
    get_init_feed_data,
    createPost,
    likePost,
    likeComment,
    createComment
}