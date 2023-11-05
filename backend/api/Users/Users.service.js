const axios = require('axios');
const auth0Manager = require('../managementAPI.js');
const {checkSceneExists} = require('../Scenes/Scenes.service.js');
const {dbDriver} = require('../db.js')

async function loggedin(req, res) {
    if(!dbDriver) {
        res.send(true)
        return 
    }

    let userID = req.auth.payload.sub

    let auth0User = await auth0Manager.getUser({id: userID})
    
    let onboarded = auth0User.hasOwnProperty('app_metadata')

    if(!onboarded) {
        // add user to db
        auth0User.app_metadata = {
            onboarded: true
        }

        const { records} = await dbDriver.executeQuery(
            'CREATE (user:USER {name: $name, authID: $authID}) RETURN user',
            { name: auth0User.nickname, authID: userID},
            { database: 'neo4j' }
        )

        await auth0Manager.updateAppMetadata({id: userID}, auth0User.app_metadata)
    }

    res.send(onboarded)
}

async function userinfo (req, res) {
    if(!dbDriver) {
        res.send({
            nickname: 'caelouwho'
        })

        return;
    }

    let userID = req.auth.payload.sub

    const { records } = await dbDriver.executeQuery(
        `
        MATCH (user:USER {authID: $authID})
        RETURN user.name as nickname
        `,
        {
            authID: userID
        },
        {database: 'neo4j'}
    )

    let user = {
        nickname: records[0].get('nickname')
    }

    res.send(user)
}

async function updateInfo (req, res){
    const userID = req.auth.payload.sub;
    const formData = req.body;

    let userRecords;

    if(formData.nickname && typeof formData.nickname === 'string' && formData.nickname.length < 150) {
        if(await usernameAvailable(formData.nickname)) {
            let {records} = await dbDriver.executeQuery(
                `MATCH (user:USER {authID: $authID})
                SET user.name = $nickname
                `,
                {
                    authID: userID,
                    nickname: formData.nickname
                },
                {
                    database: 'neo4j'
                }
            )
    
            userRecords = records;
        }
    }

    if(formData.bio && typeof formData.bio === 'string' && formData.bio.length < 150) {
        let {records} = await dbDriver.executeQuery(
            `MATCH (user:USER {authID: $authID})
            SET user.bio = $bio
            `,
            {
                authID: userID,
                bio: formData.bio
            },
            {
                database: 'neo4j'
            }
        )

        userRecords = records;
    }

    if(formData.pronouns && typeof formData.pronouns === 'string' && formData.pronouns.length < 50) {
        let {records} = await dbDriver.executeQuery(
            `MATCH (user:USER {authID: $authID})
            SET user.pronouns = $pronouns
            `,
            {
                authID: userID,
                pronouns: formData.pronouns
            },
            {
                database: 'neo4j'
            }
        )

        userRecords = records;
    }

    res.send(true)
}

async function getProfile(req, res) {
    const {records: userRecords} = await dbDriver.executeQuery(
        `MATCH (user:USER {authID: $authID})
        RETURN user.name as name, user.bio as bio, user.pronouns as pronouns
        `,
        {
            authID: req.params.userID
        },
        {database: 'neo4j'}
    )

    res.send(JSON.stringify({
        name: userRecords[0].get('name'),
        bio: userRecords[0].get('bio'),
        pronouns: userRecords[0].get('pronouns')
    }))
}

async function leaveScene(req, res) {
    let userID = req.auth.payload.sub;
    let exists = await checkSceneExists(req.body.scene, userID);

    if(exists) {
        await dbDriver.executeQuery(
            `MATCH (scene:SCENE {name: $sceneName})<-[in:PART_OF]-(user:USER {authID: $authID})
            OPTIONAL MATCH (media:POST | DOCUMENT)<-[:POSTED]-(user)
            OPTIONAL MATCH (comment:COMMENT)-[:COMMENTED_ON | REPLIED_TO *]->(media)
            OPTIONAL MATCH (page:PAGE)<-[:HAS_PAGE]-(media)
            OPTIONAL MATCH (user)-[prefer:PREFERRED_SCENE]->(scene)
            DETACH DELETE in, prefer, media, comment, page
            `,
            {
                authID: userID,
                sceneName: req.body.scene
            },
            {database: 'neo4j'}
        )
    
        res.send(await fallBackPrefered(userID))
    } else {
        res.send(false)
    }
}

async function preferScene(req, res) {
    const userID = req.auth.payload.sub
    const exists = await checkSceneExists(req.body.scene, userID)

    if(exists) {
        await dbDriver.executeQuery(
            `MATCH (scene:SCENE)<-[:PART_OF]-(user:USER {authID: $authID})
            OPTIONAL MATCH (prefScene:SCENE)<-[pref:PREFERRED_SCENE]-(user)
            DELETE pref
            `,
            {
                authID: userID,
                sceneName: req.body.scene
            },
            {database: 'neo4j'}
        )
    
        await dbDriver.executeQuery(
            `MATCH (user:USER {authID: $authID})
            MATCH (selectedScene:SCENE {name: $sceneName})
            CREATE (selectedScene)<-[:PREFERRED_SCENE]-(user)`,
            {
                authID: userID,
                sceneName: req.body.scene
            },
            {database: 'neo4j'}
        )
    
    }

    const {records: sceneRecords} = await dbDriver.executeQuery(
        `MATCH (scene:SCENE)<-[:PART_OF]-(user:USER {authID: $authID})
        OPTIONAL MATCH (scene)<-[pref:PREFERRED_SCENE]-(user)
        RETURN COUNT(pref) as prefers, scene.name as name
        `,
        {
            authID: userID,
            sceneName: req.body.scene
        },
        {database: 'neo4j'}
    )

    let scenes = [];

    for(let scene of sceneRecords) {
        scenes.push({
            name: scene.get('name'),
            preferred: scene.get('prefers').toNumber() > 0
        })
    }

    res.send(scenes)
}

async function fallBackPrefered(userID) {
    const {records: sceneRecords} = await dbDriver.executeQuery(
        `MATCH (scene:SCENE)<-[:PART_OF]-(:USER {authID: $authID})
        return scene.name as name
        `,
        {
            authID: userID
        },
        {database: 'neo4j'}
    )

    let scenes = [];

    for(let i = 0; i < sceneRecords.length; i++) {
        let preferred = false;

        if(i === 0) {
            await dbDriver.executeQuery(
                `MATCH (scene:SCENE {name: $name})<-[:PART_OF]-(user:USER {authID: $authID})
                MERGE (scene)<-[:PREFERRED_SCENE]-(user)
                `,
                {
                    name: sceneRecords[i].get('name'),
                    authID: userID
                },
                {database: 'neo4j'}
            )
            preferred = true
        }

        scenes.push({
            name: sceneRecords[i].get('name'),
            preferred,
        })
    }

    return scenes;
}

async function usernameAvailable(name) {
    const {records: availableRecords} = await dbDriver.executeQuery(
        `MATCH (user:USER {name: $username})
        RETURN user
        `,
        {
            username: name
        },
        {database: 'neo4j'}
    )

    return availableRecords.length === 0;
}

module.exports = {
    loggedin,
    userinfo,
    updateInfo,
    getProfile,
    leaveScene,
    preferScene
}
