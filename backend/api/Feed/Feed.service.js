const {dbDriver} = require('../db.js')

async function get_init_feed_data(req, res) {
    const userID = req.auth.payload.sub
 
    // send it
    const {records : prefSceneRels} = await dbDriver.executeQuery(
        'MATCH (:USER {authID: $authID})-[:PREFERRED_SCENE]->(scene:SCENE) RETURN scene.name as preferredScene',
        {
            authID: userID,
        },
        {database: 'neo4j'}
    )

    const preferredScene = prefSceneRels[0].get('preferredScene');

    const {records: sceneRecords} = await dbDriver.executeQuery(
        `MATCH (:USER {authID: $authID})-[:PART_OF]->(scene:SCENE)-[:HAS_CATEGORY]->(category:CATEGORY) 
        RETURN scene.name as name, scene.center as center, scene.range as range, COLLECT(category)`,
        {
            authID: userID
        },
        {database: 'neo4j'}
    )

    const scenes = [];

    for(const scene of sceneRecords){
        const categoryNodes = scene.get('COLLECT(category)');

        const categories = [];

        for(const cat of categoryNodes){
            categories.push({
                name: cat.properties.name,
                posts: []
            })
        }

        scenes.push({
            name: scene.get('name'),
            center: scene.get('center'),
            range: scene.get('range'),
            categories,
        })
        
    }

    const data = {
        preferredScene,
        scenes,
    }

    res.send(data);
}

async function createPost(req, res) {
    const formData = req.body;
    // const newPost = new Post(formData.creator, formData.content, formData.type) // create a new post

    const userID = req.auth.payload.sub
    const supportedTypes = ['text'];


    if(supportedTypes.indexOf(formData.type) !== -1 && formData.content.length <= 500 && typeof formData.content === 'string') {
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
        console.log('POSTING FAILED')
        res.send(false)
    }
}

async function likePost(req, res) {
    const formData = req.body;
    const userID = req.auth.payload.sub;

    const {records: likedRecords} = await dbDriver.executeQuery(
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

    const alreadyLiked = likedRecords[0].get('userLiked').toNumber() === 1 ? true : false;

    const createQuery = "CREATE (user)-[:LIKED]->(post)"

    const deleteQuery = "DELETE like"

    await dbDriver.executeQuery(
        `MATCH (post:POST)
        WHERE ID(post) = $postID
        MATCH (user:USER {authID: $authID})
        OPTIONAL MATCH (:USER)-[like:LIKED]->(post)
        OPTIONAL MATCH (user)-[userLiked:LIKED]->(post)
        ${!alreadyLiked ? createQuery : deleteQuery}
RETURN *
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
    let userID = req.auth.payload.sub;
    let formData = req.body;

    if(req.body.comment && typeof req.body.comment === 'string' && req.body.comment.length <= 500) {
        formData.root = parseInt(formData.root);
        formData.parent = parseFloat(formData.parent)
        let userID = req.auth.payload.sub;
        let relType = formData.root === formData.parent ? 'COMMENTED_ON' : 'REPLIED_TO';
    
        await dbDriver.executeQuery(
            `MATCH (parent:POST|COMMENT)
            WHERE ID(parent) = $parentID
            MATCH (user:USER {authID: $authID})-[:PART_OF]->(:SCENE {name: $sceneName})-[:HAS_CATEGORY]->(:CATEGORY {name: $categoryName})<-[:POSTED_ON]-(root:POST)
            WHERE ID(root) = $rootID
            CREATE (user)-[:COMMENTED]->(comment:COMMENT {content: $content, timestamp: $timestamp})-[:${relType}]->(parent)`,
            {
                parentID: formData.parent,
                rootID: formData.root,
                content: formData.comment,
                categoryName: formData.category,
                sceneName: formData.scene,
                timestamp: Date.now(),
                authID: userID,
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
        `MATCH (scene:SCENE)-[:HAS_DOCUMENT]->(document:DOCUMENT)-[:HAS_PAGE]->(page:PAGE)
        WHERE ID(document) = toInteger($docID)
        RETURN document.title as title, document.timestamp as timestamp, COLLECT(page) as pages, scene.name as scene
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
        scene: documentRecords[0].get('scene'),
        loaded: true
    }))
}

async function reportMedia(req, res) {
    const formData = req.body
    const userID = req.auth.payload.sub;

    const {records: alreadyReportedRecords} = await dbDriver.executeQuery(
        `MATCH (user:USER {authID: $authID})-[:PART_OF]->(:SCENE {name: $scene})-[:HAS_CATEGORY | POSTED_ON | HAS_DOCUMENT | COMMENTED_ON | REPLIED_TO *]
        -(media:POST | COMMENT | DOCUMENT)<-[report:REPORTED]-(:USER) 
        OPTIONAL MATCH (user)-[repByUser:REPORTED]->(media)
        RETURN COUNT(report) as reported, COUNT(repByUser) as repByUser
        `,
        {
            mediaID: formData.mediaID,
            scene: formData.scene,
            authID: userID,
        },
        {database: 'neo4j'}
    );

    const alreadyReported = alreadyReportedRecords[0].get('reported').toNumber() > 0;
    const reportedByUser = alreadyReportedRecords[0].get('repByUser').toNumber() > 0;

    if(alreadyReported && !reportedByUser) {
        voteToRemove(req, res);
        return
    }

    await dbDriver.executeQuery(
        `MATCH (user:USER {authID: $authID})-[:PART_OF]->
        (:SCENE {name: $sceneName})-[:HAS_CATEGORY | POSTED_ON | HAS_DOCUMENT | COMMENTED_ON | REPLIED_TO *]-
        (media:POST | COMMENT | DOCUMENT)
        WHERE ID(media) = $mediaID
        MERGE (user)-[report:REPORTED]->(media)
        RETURN report.votes as votes, ID(report) as reportID
        `,
        {
            mediaID: formData.mediaID,
            sceneName: formData.scene,
            authID: userID,
        },
        {database: 'neo4j'}
    )

    await checkAndRemoveReportedMedia(formData.mediaID, formData.scene)

    res.send(true)
}

async function voteToRemove(req, res) {
    const formData = req.body;
    const userID = req.auth.payload.sub;

    const {records: repByUserRecords} = await dbDriver.executeQuery(
        `MATCH (:USER {authID: $authID})-[repByUser:REPORTED | VOTED_TO_REMOVE]->(media:POST | COMMENT | DOCUMENT)
        WHERE ID(media) = $mediaID
        RETURN repByUser`,
        {
            mediaID: formData.mediaID, 
            authID: userID
        },
        {database: 'neo4j'}
    )

    if(repByUserRecords.length > 0) {
        return 
    }

    const {records: voteRecords} = await dbDriver.executeQuery(
        `MATCH (user:USER {authID: $authID})-[:PART_OF]->(:SCENE {name: $scene})-[:HAS_CATEGORY | POSTED_ON | HAS_DOCUMENT | COMMENTED_ON | REPLIED_TO *]
        -(media:POST | COMMENT | DOCUMENT)<-[:REPORTED]-(:USER)
        WHERE ID(media) = $mediaID
        MERGE (user)-[report:VOTED_TO_REMOVE]->(media)
        RETURN COUNT(report) as success
        `,
        {
            scene: formData.scene,
            mediaID: formData.mediaID, 
            authID: userID
        },
        {database: 'neo4j'}
    );
    res.send(voteRecords[0].get('success').toNumber() > 0);
    checkAndRemoveReportedMedia(formData.mediaID, formData.scene)
}

async function checkAndRemoveReportedMedia(mediaID, sceneName) {
    const {records: totalUserRecords} = await dbDriver.executeQuery(
        `MATCH (user:USER)-[:PART_OF]->(:SCENE {name: $sceneName})
        RETURN COUNT(user) as users
        `,
        {
            sceneName
        },
        {database: 'neo4j'}
    );

    let totalUsers = totalUserRecords[0].get('users').toNumber();

    const {records: votesForRemovalRecords} = await dbDriver.executeQuery(
        `MATCH (:USER)-[vote:REPORTED | VOTED_TO_REMOVE]->(media:POST | COMMENT | DOCUMENT)-[:HAS_CATEGORY | POSTED_ON | HAS_DOCUMENT | COMMENTED_ON | REPLIED_TO *]-(:SCENE {name: $sceneName})
        WHERE ID(media) = $mediaID
        RETURN COUNT(vote) as votes
        `,
        {
            mediaID,
            sceneName
        },
        {database: 'neo4j'}
    );

    let votes = votesForRemovalRecords[0].get('votes').toNumber()
    console.log(totalUsers, votes)
    let percentVote = (votes/totalUsers) * 100;
    console.log(percentVote) 
    if(percentVote >= 66) {
        console.log("DELETE")
        await dbDriver.executeQuery(
            `MATCH (media:POST | COMMENT | DOCUMENT)
            WHERE ID(media) = $mediaID
            OPTIONAL MATCH (media)-[:COMMENTED_ON | HAS_PAGE | REPLIED_TO *]-(children)
            DETACH DELETE media, children
            `,
            {
                mediaID,
                sceneName
            },
            {database: 'neo4j'}
        )

        return true
    }

    return false
}

async function userInScene(authID, sceneName) {
    const {records: existsRecords} = await dbDriver.executeQuery(
        `MATCH (user:USER {authID: $authID})-[:PART_OF]->(:SCENE {name: $sceneName})
        `,
        {
            authID,
            sceneName,
        },
        {database: 'neo4j'}
    )

    return existsRecords.length > 0
}

async function getPostByID(req, res){
    const userID = req.auth.payload.sub;

    const {records: postRecords} = await dbDriver.executeQuery(
        `MATCH (originUser:USER {authID: $authID})-[:PART_OF]->(:SCENE)-[:HAS_CATEGORY]->(:CATEGORY)<-[:POSTED_ON]-(post:POST)<-[:POSTED]-(user:USER)
        WHERE ID(post) = $postID
        OPTIONAL MATCH (:COMMENT)-[commentCount:COMMENTED_ON]->(post)
        OPTIONAL MATCH (:USER)-[like:LIKED]->(post)
        OPTIONAL MATCH (originUser)-[userLiked:LIKED]->(post)
        RETURN post.content as content, post.type as type, post.timestamp as timestamp, COLLECT(user) as user, COLLECT(like) as likes, COUNT(userLiked) as liked, ID(post) as postID, COLLECT(commentCount) as commentCount
        `,
        {
            authID: userID,
            postID: parseInt(req.params.id)
        },
        {database: 'neo4j'}
    )

    if(postRecords.length > 0) {
        const author = {
            name: postRecords[0].get("user")[0].properties.name, 
            userID: postRecords[0].get("user")[0].properties.authID
        };
        const post = postNodeToPostObject(postRecords[0], author);
        res.send(post);
        return;
    }

    res.send(false)
}

function postNodeToPostObject(post, author) {
    const id = post.get('postID').toNumber();
    const likes = post.get('likes');
    let numLikes = 0;
    const processedLikeIDs = [];

    const comments = post.get("commentCount");
    let numComments = 0;
    const proccessedCommentIDS = [];
    
    for(const like of likes) {
        if(processedLikeIDs.indexOf(like.identity.toNumber()) === -1) {
            processedLikeIDs.push(like.identity.toNumber());
            numLikes++;
        }  
    }

    for(const comment of comments) {
        if(proccessedCommentIDS.indexOf(comment.identity.toNumber()) === -1) {
            proccessedCommentIDS.push(comment.identity.toNumber());
            numComments++;
        }
    }
    
    return {
        content: post.get('content'),
        type: post.get('type'),
        timestamp: post.get('timestamp'),
        author,
        likes: numLikes,
        liked: post.get('liked').toNumber() > 0 ? true : false,
        postID: id,
        commentCount: numComments,
        comments: []
    }
}

module.exports = {
    get_init_feed_data,
    createPost,
    likePost,
    likeComment,
    createComment,
    createDocument,
    getDocument,
    reportMedia,
    voteToRemove,
    checkAndRemoveReportedMedia,
    getPostByID,
    postNodeToPostObject,
}
