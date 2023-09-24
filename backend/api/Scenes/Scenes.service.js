const axios = require("axios");
const retry = require("axios-retry");
const auth0Manager = require("../managementAPI");

const { mongo } = require("../mongo");

const { Scene } = require("../../objects/Scene.object");

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

    // create a new scene object
    let created = new Scene(name, formData.user, formData.center, formData.range)

    await mongo.connect();
    const database = mongo.db(process.env.DATABASE);
    const collection = database.collection("Scenes");
    let createdScene = await collection.insertOne(created); // add the scene

    await addUserToScene(formData.user.sub, createdScene.insertedId)
    
    res.send(JSON.stringify(true)) // send true if it worked
}

async function get_locality(req, res) {
    let latLng = req.params.latlng.split(",")
    res.send(await fetchReverseGeocode(...latLng)) // this is just so we can send geocode info from our own api without exposing secrets
}

async function get_scenes(req, res) {
    await mongo.connect()
    const database = mongo.db(process.env.DATABASE);
    const collection = database.collection("Scenes");

    let docs = await collection.find();
    let scenes = []
    for await (const doc of docs) {
        scenes.push({
            _id: doc._id,
            name: doc.name,
            center: doc.center,
            logo: doc.logo,
            range: doc.range,
        })
    }

    res.send(scenes)
}

async function join_scene (req, res) {
    console.log(req.body)
    await addUserToScene(req.body.userID, req.body.sceneID)
    res.send(true)
}

async function addUserToScene(userID, sceneID) {
    let newMetadata = await auth0Manager.getUser({id: userID});
    // get the user metadata

    if(newMetadata.hasOwnProperty("app_metadata")) { // check if user has app metadata
        newMetadata = newMetadata.app_metadata; // if it doesn't add it
    } else {
        newMetadata = {}
    }
    
    if(!newMetadata.hasOwnProperty("Scenes")) { //if the metadata doesn't have a scenes array
        newMetadata.Scenes = [] // add one
    }

    if(!newMetadata.Scenes.includes(sceneID)) { // if not already in scene
        if(!newMetadata.hasOwnProperty("preferredScene")) { // if we don't have a preferred scene
            // the one that was just created is preferred
            newMetadata.preferredScene = sceneID
        }
    
        newMetadata.Scenes.push(sceneID); // add the scene id to the users scenes
    
        await auth0Manager.updateAppMetadata({id: userID}, newMetadata); // update the metadata
    } else {
        console.log("IN SCENE")
    }
}

module.exports = {
    create,
    get_locality,
    get_scenes,
    join_scene
}