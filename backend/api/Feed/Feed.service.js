const {dbDriver} = require('../db.js')

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
    let supportedTypes = ['text'];

    if(formData.type in supportedTypes && formData.content.length <= 500 && typeof formData.content === 'string') {
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
    } else {
        res.send(false)
    }
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

    res.send(alreadyLiked)
}

async function createComment(req, res) {
    let formData = req.body;
    if(req.body.comment && typeof req.body.comment === 'string' && req.body.comment.length <= 500) {
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
        let newPost = true
    
        res.send(newPost)
    }
}

async function createDocument(req, res) {
    let userID = req.auth.payload.sub;
    let formData = req.body;

    if(typeof formData.title !== 'string' || formData.title.length > 100) {
        res.send(false);
        return;
    }

    let {records: documentRecords} = await dbDriver.executeQuery(
        `MATCH (user:USER {authID: $authID})
        -[:PART_OF]->(scene:SCENE {name: $sceneName})
        MERGE (user)
        -[:POSTED]->(doc:DOCUMENT {title:$title, timestamp: $timestamp})
        <-[:HAS_DOCUMENT]-(scene)
        return doc.title as title
        `,
        {
            authID: userID,
            sceneName: formData.sceneID,
            title: formData.title,
            timestamp: Date.now(),
        },
        {database: 'neo4j'}
    )

    for(let i = 0; i < formData.pages.length; i++) {
        let page = formData.pages[i];

        if(typeof page === 'string' && page.length <= 1500) {
            if(page.length > 0) {
                console.log(page)
                let {records: pageRecords} = await dbDriver.executeQuery(
                    `MATCH (document:DOCUMENT {title: $title})
                    CREATE (document)-[:HAS_PAGE]->(:PAGE {content: $content, index: $index})
                    `,
                    {
                        title: documentRecords[0].get('title'),
                        index: i,
                        content: page
                    },
                    {database: 'neo4j'}
                )
            }
        }
    }

    res.send(true)
}

async function getDocument(req, res) {
    const {records: documentRecords} = await dbDriver.executeQuery(
        `MATCH (document:DOCUMENT)-[:HAS_PAGE]->(page:PAGE)
        WHERE ID(document) = toInteger($docID)
        RETURN document.title as title, document.timestamp as timestamp, COLLECT(page) as pages
        `,
        {
            docID: req.params.docID,
        },
        {database: 'neo4j'}
    )

    let pages = [];

    for(let page of documentRecords[0].get('pages')) {
        pages[parseInt(page.properties.index)] = page.properties.content
    }

    res.send(JSON.stringify({
        title: documentRecords[0].get('title'),
        timestamp: documentRecords[0].get('timestamp'),
        pages,
        loaded: true
    }))
}

module.exports = {
    get_init_feed_data,
    createPost,
    likePost,
    likeComment,
    createComment,
    createDocument,
    getDocument,
}