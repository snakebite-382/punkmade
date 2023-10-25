const jose = require('jose');
const { dbDriver } = require('./db')
 
const JWKS = jose.createRemoteJWKSet(
    new URL(`https://punkmade.us.auth0.com/.well-known/jwks.json`)
);

async function WebsocketServer(io) { 
    io.on('connection', HandleConnection)
}

function HandleConnection(socket) {
    console.log(`connected socket of ID ${socket.id}`);

    socket.on('auth', async (token, callback) => {
        const { payload: result } = await jose.jwtVerify(token, JWKS, {
            issuer: `https://punkmade.us.auth0.com/`,
        });
        
        if(result) {
            socket.data_authenticated = true;
            socket.data_userID = result.sub;

            callback(true)
        } else {
            callback(false)
        }
    })

    socket.on('get posts', async (scene, category, start, end, callback) => {
        if(socket.data_authenticated) {
            let posts = await getPosts(socket.data_userID, scene, category, start, end)
            callback(posts);
        } else {
            callback(false)
        }
    })

    socket.on('get comments', async(scene, category, targetID, start, end, callback) => {
        if(socket.data_authenticated) {
            let comments = await getComments(socket.data_userID, scene, category, targetID, start, end);
            callback(comments);
        } else {
            callback = false;
        }
    })

    socket.on('disconnect', HandleDisconnect)
}

async function HandleDisconnect() {
    console.log(`socket disconnected`)
}


function postNodeToPostObject(post, author) {
    let id = post.get('postID').toNumber();

    return {
        content: post.get('content'),
        type: post.get('type'),
        timestamp: post.get('timestamp'),
        author,
        likes: post.get('likes').toNumber(),
        liked: post.get('liked').toNumber() === 1 ? true : false,
        postID: id,
        commentCount: post.get('commentCount').toNumber(),
        comments: []
    }
}

/**
 * 
 * @param {String} userID authID of the user
 * @param {String} scene name of scene
 * @param {String} category name of category
 * @param {Number} start how many previous posts to skip
 * @param {Number} end what index to go up to
 * @returns Posts[Post]
 */
async function getPosts(userID, scene, category, start, end) {
    if(dbDriver) {
        const {records: postRecords} = await dbDriver.executeQuery(
            `MATCH (user:USER {authID: $authID})-[:PART_OF]
            ->(:SCENE {name: $sceneName})-[:HAS_CATEGORY]
            ->(:CATEGORY {name: $categoryName})<-[:POSTED_ON]
            -(post:POST) 
            OPTIONAL MATCH (:COMMENT)-[commentCount:COMMENTED_ON]->(post)
            OPTIONAL MATCH (:USER)-[like:LIKED]->(post)
            OPTIONAL MATCH (user)-[userLiked:LIKED]->(post)
            RETURN post.content as content, post.type as type, post.timestamp as timestamp, COLLECT(user), COUNT(like) as likes, COUNT(userLiked) as liked, ID(post) as postID, COUNT(commentCount) as commentCount
            ORDER BY timestamp DESC
            SKIP toInteger($skip)
            LIMIT toInteger($limit)`,
            {
                authID: userID,
                sceneName: scene,
                categoryName: category,
                skip: start,
                limit: end - start
            },
            {database: 'neo4j'}
        )
    
        let posts = []
        
        for(let post of postRecords) {
            let authorNode = post.get("COLLECT(user)")
            let author = authorNode[0].properties.name
    
            posts.push(postNodeToPostObject(post, author))
        }
            
        return posts;   
    } else {
        return [
            {
                content: "# TEST POST FROM FAKED DB",
                type: 'text',
                timestamp: Date.now(),
                author: "caelouwho",
                likes: 0,
                liked: false,
                postID: 1,
                commentCount: 1,
                comments: []
            }
        ]
    }
}

function commentNodeToCommentObject(comment) {
    let id = comment.get('commentID').toNumber();
    let author = comment.get('author')[0].properties.name

    return {
        commentID: id,
        content: comment.get('content'),
        timestamp: comment.get('timestamp'),
        author,
        likes: comment.get('likes').toNumber(),
        liked: comment.get('liked').toNumber() === 1 ? true : false,
        replies: []
    }
}

async function getComments(userID, scene, category, targetID, start, end) {
    if(dbDriver) {
        const {records: commentRecords} = await dbDriver.executeQuery(
            `
            MATCH (comment:COMMENT)-[:COMMENTED_ON | REPLIED_TO ]
            ->(target)-[:POSTED_ON | REPLIED_TO | COMMENTED_ON *]
            ->(:CATEGORY {name: $categoryName})<-[:HAS_CATEGORY]
            -(:SCENE {name: $sceneName})
            WHERE id(target) = toInteger($targetID)
            MATCH (author:USER)-[:COMMENTED]->(comment)
            OPTIONAL MATCH (:USER)-[like:LIKED]->(comment)
            OPTIONAL MATCH (user:USER {authID: $userID})-[userLiked:LIKED]->(comment)
            RETURN comment.content as content, comment.timestamp as timestamp, id(comment) as commentID, COLLECT(author) as author, COUNT(like) as likes, COUNT(userLiked) as liked
            ORDER BY timestamp ASC
            SKIP toInteger($skip)
            LIMIT toInteger($limit)
            `,
            {
                categoryName: category,
                sceneName: scene,
                targetID: parseInt(targetID),
                userID: userID,
                skip: parseInt(start),
                limit: parseInt(end)- parseInt(start)
            },
            {
                database: 'neo4j'
            }
        )

        let comments = []

        for(let comment of commentRecords) {
            comments.push(commentNodeToCommentObject(comment))
        }

        return comments;
    } else {
        return [
            {
                content: "COMMENT",
                commentID: 2,
                timestamp: Date.now(),
                author: "caelouwho",
                likes: 0,
                liked: false,
                replies: []
            }
        ]
    }
}

module.exports = {
    WebsocketServer,
    postNodeToPostObject
};