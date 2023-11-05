const axios = require("axios");
const { dbDriver } = require("../db.js");

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
    const formData = req.body;

    if(formData.range > 30) {
        formData.range = 30;
    } else if(formData.range < 10) {
        formData.range = 10;
    }

    let invalid = false;

    if(center[0] === NaN || typeof center[0] != 'number') {
        res.send(false)
        return
    }

    if(center[1] === NaN || typeof center[1] != 'number') {
        res.send(false)
        return
    }

    const {records: sceneRecords} = await dbDriver.executeQuery(
        'MATCH (scene:SCENE) RETURN scene.name, scene.center, scene.range',
        {},
        {database: 'neo4j'}
    )

    for(scene of sceneRecords) {
        let sceneCenter = scene.get('scene.center');

        if(tooClose(formData.center[0], formData.center[1], sceneCenter[0], sceneCenter[1], scene.get('scene.range'))) {
            invalid = true;
        }
    }

    if(!invalid) {
        // get the name (cuz we don't trust users, grrrr)
        let name = await fetchReverseGeocode(...formData.center); 
        name = name.locality + " Punk"

        let userID = req.auth.payload.sub;

        await dbDriver.executeQuery(
            `MATCH (user:USER {authID: $authID}) 
            MERGE (scene:SCENE {name: $sceneName}) 
            SET scene.center = $center, scene.range = $range
            CREATE (user)-[:PART_OF]->(scene)
            MERGE (scene)-[:HAS_CATEGORY]->(:CATEGORY {name: 'general'})
            MERGE (scene)-[:HAS_CATEGORY]->(:CATEGORY {name: 'art/music'}) 
            MERGE (scene)-[:HAS_CATEGORY]->(:CATEGORY {name: 'political'})`,
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
    } else {
        console.log("INVALID")
    }
}

async function get_locality(req, res) {
    let latLng = req.params.latlng.split(",")

    if(latLng[0] === NaN || typeof latLng[0] != 'number') {
        res.send(false)
        return
    }
    if(latLng[1] === NaN || typeof latLng[1] != 'number') {
        res.send(false)
        return
    }

    res.send(await fetchReverseGeocode(...latLng)) // this is just so we can send geocode info from our own api without exposing secrets
}

async function get_scenes(req, res) {
    let userLat = parseFloat(req.params.p1.split(',')[0]);
    let userLon = parseFloat(req.params.p1.split(',')[1]);

    if(userLat === NaN || userLon === NaN) {
        res.send(false)
        return 
    }

    const {records} = await dbDriver.executeQuery(
        `MATCH (scene:SCENE)
        OPTIONAL MATCH (user:USER {authID: $authID})-[:PART_OF]-(scene)
        OPTIONAL MATCH (user)-[pref:PREFERRED_SCENE]-(scene)
        RETURN scene.name, scene.center, scene.range, COUNT(user) AS partOf, COUNT(pref) as prefers`,
        {
            authID: req.auth.payload.sub
        },
        {database: 'neo4j'}
    )

    let scenes = []

    records.forEach(record => {
        let center = record.get('scene.center');
        let range = record.get('scene.range');

        let lat2 = center[0];
        let lon2 = center[1];

        

        scenes.push({
            name: record.get('scene.name'),
            center: center,
            range: range,
            inSceneRange: tooClose(userLat, userLon, lat2, lon2, range),
            inScene: record.get('partOf').toNumber() > 0,
            preferred: record.get('prefers').toNumber() > 0,
        })
    })

    res.send(scenes)
}

async function join_scene (req, res) {
    if(!req.body.sceneName) {
        res.send(false)
        return 
    }

    if(req.body.sceneName) {
        let userID = req.auth.payload.sub;

        console.log('User: ' + userID + ' joining ' + req.body.sceneName)

        await dbDriver.executeQuery(
            "MATCH (user:USER {authID: $authID}) MATCH (scene:SCENE {name: $sceneName}) MERGE (user)-[:PART_OF]->(scene)",
            {
                authID: userID, 
                sceneName: req.body.sceneName
            },
            {database: 'neo4j'}
        )

        await preferredSceneChecking(userID, req.body.sceneName)

        res.send(true)
                
    }
}

function tooClose(userLat, userLon, lat2, lon2, range) {
    var R = 6372.0710; // Radius of the Earth in km
    var rlat1 = userLat * (Math.PI/180); // Convert degrees to radians
    var rlat2 = lat2 * (Math.PI/180); // Convert degrees to radians
    var difflat = rlat2-rlat1; // Radian difference (latitudes)
    var difflon = (lon2-userLon) * (Math.PI/180); // Radian difference (longitudes)

    var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));

    return d <= range;
}

async function getMyScenes(req, res) {
    const userID = req.auth.payload.sub;

    const {records: sceneRecords} = await dbDriver.executeQuery(
        `MATCH (scene:SCENE)<-[:PART_OF]-(user:USER {authID: $authID})
        OPTIONAL MATCH (scene)<-[pref:PREFERRED_SCENE]-(user)
        RETURN scene.name as name, COUNT(pref) as prefers
        `,
        {
            authID: userID,
        },
        {database: 'neo4j'}
    );

    let scenes = [];

    for(let scene of sceneRecords) {
        scenes.push({
            name: scene.get('name'),
            preferred: scene.get('prefers').toNumber() > 0,
        })
    }
    res.send(scenes);
}

module.exports = {
    create,
    get_locality,
    get_scenes,
    join_scene,
    getMyScenes,
}
