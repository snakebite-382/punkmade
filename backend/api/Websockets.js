const jose = require('jose');
const uuid = require("uuid")
const { dbDriver } = require('./db')
const { checkAndRemoveReportedMedia, postNodeToPostObject } = require('./Feed/Feed.service.js') 
const JWKS = jose.createRemoteJWKSet(
    new URL("https://punkmade.us.auth0.com/.well-known/jwks.json")
);

async function WebsocketServer(io) { 
    io.on('connection', HandleConnection)
}

function HandleConnection(socket) {
    socket.on('auth', async (token, callback) => {
        const { payload: result } = await jose.jwtVerify(token, JWKS, {
            issuer: "https://punkmade.us.auth0.com/",
        });
        
        if(result) {
            socket.data_authenticated = true;
            socket.data_userID = result.sub;
            console.log("EMITTING")
            socket.emit("foo", "bar");

            callback(true)

            await new Promise(resolve => setTimeout(resolve, 5 * 1000))
        } else {
            callback(false)
        }
    });

    socket.on('stream posts', async (scene, category, start, end) => {
        console.log("HIT", scene, category, start, end)
        if(socket.data_authenticated) {
            const id = uuid.v4();

            socket.emit("set taskID", id);

            for(let i = start; i < end; i++) {
                console.log("SENDING POST")
                
                const response = {
                    post: (await getPosts(socket.data_userID, scene, category, i, i+1))[0],
                    taskID: id,
                }

                if(!response.post) break;  

                socket.emit("return post", response);
            }
       }
    });

    socket.on('stream comments', async(targetID, start, end) => {
        if(socket.data_authenticated) {
            // const comments = await getComments(socket.data_userID, scene, category, targetID, start, end);
            for(let i = start; i < end; i++) {
                const response = {
                    comment: (await getComments(socket.data_userID, targetID, i, i+1))[0],
                    mediaID: targetID,
                }

                if(!response.comment) break;

                socket.emit("return comment", response)
            }
        }
    });

    socket.on('get documents', async(scene, start, end, callback) => {
        if(socket.data_authenticated) {
            const documents = await getDocuments(scene, start, end)

            callback(documents)
        }
    });

    socket.on('get reports', async(scene, start, end, callback) => {
        if(!socket.data_authenticated) {
            return 
        }

        const reports = await getReports(scene, start, end, socket.data_userID)

        callback(reports)
    })

    socket.on('disconnect', HandleDisconnect);
}

async function HandleDisconnect() {
}

async function getDocuments(scene, start, end, authID) {
    start = parseInt(start);
    end = parseInt(end)

    console.log(start, end)

    const {records: documentRecords} = await dbDriver.executeQuery(
        `MATCH (:SCENE {name: $scene})-[:HAS_DOCUMENT]->(doc:DOCUMENT)-[:HAS_PAGE]->(page:PAGE)
        RETURN doc.title AS title, doc.timestamp AS timestamp, COLLECT(page) as pages, ID(doc) as id
        ORDER BY timestamp ASC
        SKIP toInteger($start)
        LIMIT toInteger($end)
        `,
        {
            scene,
            start: start,
            end: end - start,
        },
        {database: 'neo4j'}
    )

    let documents = [];

    for(let document of documentRecords) {
        let pages = [];

        for(let page of document.get('pages')) {
            pages[parseInt(page.properties.index)] = page.properties.content
        }
        
        documents.push({
            title: document.get('title'),
            id: document.get('id').toNumber(),
            timestamp: document.get('timestamp'),
            pages,
        })
    }

    return documents;
}

async function getReports(scene, start, end, authID) { 
    const {records: reportRecords} = await dbDriver.executeQuery(
        `OPTIONAL MATCH (:USER {authID: $authID})-[:REPORTED | VOTED_TO_REMOVE]-(reported:POST | DOCUMENT | COMMENT)
        WITH COLLECT(reported) as reported
        MATCH (:SCENE {name: $scene})-[:HAS_CATEGORY | POSTED_ON | HAS_DOCUMENT | COMMENTED_ON | REPLIED_TO *]
        -(media:POST | COMMENT | DOCUMENT)<-[report:REPORTED]-(reporter:USER)
        WHERE NOT(media IN reported)
        MATCH (reportee:USER)-[:POSTED | COMMENTED]-(media)
        MATCH (:USER)-[vote:REPORTED | VOTED_TO_REMOVE]-(media)
        RETURN media.content as content, reporter.name as reporter, reportee.name as reportee, COUNT(vote) as votes, ID(media) as mediaID, media.title as title, media.timestamp as timestamp
        SKIP toInteger($skip)
        LIMIT toInteger($limit)
        `,
        {
            authID, 
            scene,
            skip: start,
            limit: end - start
        },
        {database: 'neo4j'}
    )

    let reports = []

    for(let report of reportRecords) {
        console.log("CALLING")
        checkAndRemoveReportedMedia(report.get("mediaID"), "Boston Punk")
        const mediaID = report.get('mediaID').toNumber()
        const content = report.get('content')
        let docDetails = {};
    
        if(report.get('content') === null) {
            docDetails.title = report.get('title')
            docDetails.timestamp = report.get('timestamp')
            docDetails.pages = []

            const {records: pageRecords} = await dbDriver.executeQuery(
                `MATCH (doc:DOCUMENT)-[:HAS_PAGE]->(page:PAGE)
                WHERE ID(doc) = $mediaID
                RETURN page.index as index, page.content as content
                `,
                {
                    mediaID,
                },
                {}
            )

            for(let page of pageRecords) {
                docDetails.pages[parseInt(page.get('index'))] = page.get('content')
            }
        }

        reports.push({
            content: content,
            docDetails,
            reporter: report.get('reporter'),
            reportee: report.get('reportee'),
            votes: report.get('votes').toNumber(),
            mediaID,
        })
    }

    return reports
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
            `OPTIONAL MATCH (originUser:USER {authID: $authID})-[:REPORTED | VOTED_TO_REMOVE]-(reported:POST)
            WITH COLLECT(reported) as reported
            MATCH (originUser)-[:PART_OF]
            ->(:SCENE {name: $sceneName})-[:HAS_CATEGORY]
            ->(:CATEGORY {name: $categoryName})<-[:POSTED_ON]
            -(post:POST)<-[:POSTED]-(user:USER)
            WHERE NOT(post IN reported)
            OPTIONAL MATCH (:COMMENT)-[commentCount:COMMENTED_ON]->(post)
            OPTIONAL MATCH (:USER)-[like:LIKED]->(post)
            OPTIONAL MATCH (originUser)-[userLiked:LIKED]->(post)
            RETURN post.content as content, post.type as type, post.timestamp as timestamp, COLLECT(user) as user, COLLECT(like) as likes, COUNT(userLiked) as liked, ID(post) as postID, COLLECT(commentCount) as commentCount
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
        const posts = []
        
        for(const post of postRecords) {
            const authorNode = post.get("user")
            const author = {
                name: authorNode[0].properties.name,
                userID: authorNode[0].properties.authID
            }

            const postObj = postNodeToPostObject(post, author)
            console.log(postObj.likes) 
            posts.push(postObj)
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

async function getComments(userID,targetID, start, end) {
    if(dbDriver) {
        const {records: commentRecords} = await dbDriver.executeQuery(
            `
            MATCH (comment:COMMENT)-[:COMMENTED_ON | REPLIED_TO ]
            ->(target)-[:POSTED_ON | REPLIED_TO | COMMENTED_ON *]
            ->(:CATEGORY)<-[:HAS_CATEGORY]
            -(:SCENE)<-[:PART_OF]-(user:USER {authID: $userID})
            WHERE id(target) = toInteger($targetID)
            MATCH (author:USER)-[:COMMENTED]->(comment)
            OPTIONAL MATCH (:USER)-[like:LIKED]->(comment)
            OPTIONAL MATCH (user)-[userLiked:LIKED]->(comment)
            RETURN comment.content as content, comment.timestamp as timestamp, id(comment) as commentID, COLLECT(author) as author, COUNT(like) as likes, COUNT(userLiked) as liked
            ORDER BY timestamp ASC
            SKIP toInteger($skip)
            LIMIT toInteger($limit)
            `,
            {
                targetID: parseInt(targetID),
                userID: userID,
                skip: parseInt(start),
                limit: parseInt(end)- parseInt(start)
            },
            {
                database: 'neo4j'
            }
        )

        const comments = []

        for(const comment of commentRecords) {
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
