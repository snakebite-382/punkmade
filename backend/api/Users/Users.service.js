const axios = require('axios');
const auth0Manager = require('../managementAPI.js');
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

        console.log(records[0])

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

    if(formData.nickname) {
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

    if(formData.bio) {
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

    if(formData.pronouns) {
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

module.exports = {
    loggedin,
    userinfo,
    updateInfo,
    getProfile,
}
