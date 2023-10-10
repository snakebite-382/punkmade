const axios = require('axios');
const auth0Manager = require('../managementAPI');
const {dbDriver} = require('../db')

async function loggedin(req, res) {
    let userID = req.auth.payload.sub
    let driver = await dbDriver;

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
}

module.exports = {
    loggedin
}
