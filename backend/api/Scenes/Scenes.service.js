const axios = require("axios");
const auth0Manager = require("../managementAPI");

const { Scene } = require("../../objects/Scene.object");
const { dbDriver } = require("../db");

async function preferredSceneChecking(userID, sceneName) {
    const {records} = await dbDriver.executeQuery(
        'MATCH (user:USER {authID: $authID})-[rel:PREFERRED_SCENE]->(:SCENE) return rel',
        {
            authID: userID
        },
        {database: "neo4j"}
    )

    if(records.length === 0) {
        await dbDriver.executeQuery(
            `MATCH (user:USER {authID: $authID}) 
            MATCH (scene:SCENE {name: $name}) 
            CREATE (user)-[:PREFERRED_SCENE]->(scene)`,
            {
                authID: userID,
                name: sceneName,
            },
            {database: 'neo4j'}
        )
    }
}

async function fetchReverseGeocode(lat, lng) {
    // reverse geocode coords
    let locality;
    await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${process.env.GEO_CODING_API_KEY}`)
    .then((result) => { 
        // the most relevant name is the first feature, and we want the city
        locality = result.data.features[0].properties.city
    }).catch(e => {
        console.log(e)
    })

    return {locality}; // return it as an object so it can be stringified and sent with JSON
}

async function create(req, res) {
    const formData = req.body

    // get the name (cuz we don't trust users, grrrr)
    let name = await fetchReverseGeocode(...formData.center); 
    name = name.locality + " Punk"

    let userID = req.auth.payload.sub;

    await dbDriver.executeQuery(
        `MATCH (user:USER {authID: $authID}) 
        MERGE (scene:SCENE {name: $sceneName}) 
        SET scene.center = $center, scene.range = $range
        CREATE (user)-[:PART_OF]->(scene)
        CREATE (scene)-[:HAS_CATEGORY]->(:CATEGORY {name: 'general'})
        CREATE (scene)-[:HAS_CATEGORY]->(:CATEGORY {name: 'art/music'}) 
        CREATE (scene)-[:HAS_CATEGORY]->(:CATEGORY {name: 'political'})`,
        {
            authID: userID,
            sceneName: name,
            center: formData.center,
            range: formData.range
        },
        {database: 'neo4j'}
    )

    await preferredSceneChecking(userID, name)
    
    res.send(true) // send true if it worked
}

async function get_locality(req, res) {
    let latLng = req.params.latlng.split(",")
    res.send(await fetchReverseGeocode(...latLng)) // this is just so we can send geocode info from our own api without exposing secrets
}

async function get_scenes(req, res) {

    const {records} = await dbDriver.executeQuery(
        'MATCH (scene:SCENE) RETURN scene.name, scene.center, scene.range',
        {},
        {database: 'neo4j'}
    )

    let scenes = []

    records.forEach(record => {
        scenes.push({
            name: record.get('scene.name'),
            center: record.get('scene.center'),
            range: record.get('scene.range')
        })
    })

    res.send(scenes)
}

async function join_scene (req, res) {
    let userID = req.auth.payload.sub;

    await dbDriver.executeQuery(
        "MATCH (user:USER {authID: $authID}) MATCH (scene:SCENE {name: $sceneName}) MERGE (user)-[:PART_OF]->(scene)",
        {
            authID: userID, 
            sceneName: req.body.sceneName},
        {database: 'neo4j'}
    )

    await preferredSceneChecking(userID, req.body.sceneName)

    res.send(true)
}

module.exports = {
    create,
    get_locality,
    get_scenes,
    join_scene
}
