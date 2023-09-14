const axios = require("axios");
const retry = require("axios-retry");
const auth0Manager = require("../managementAPI");

const { mongo } = require("../mongo");

const { Scene } = require("../../objects/Scene.object");

async function fetchReverseGeocode(lat, lng) {
    // reverse geocode coords
    let locality;
    await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat.toString()},${lng.toString()}&result_type=locality&key=${process.env.GEO_CODING_API_KEY}`)
    .then((result) => { 
        // the most relevant name is the first address of the first result, and we want the shorthand name
        locality = result.data.results[0].address_components[0].short_name
    })

    return locality;
}

async function create(req, res) {
    const formData = req.body
    console.log(formData)

    let name = await fetchReverseGeocode(...formData.center); 
    name += " Punk"
    console.log(name) // the name is just the locality + Punk (e.g. Boston Punk)

    let created = new Scene(name, formData.user.sub, formData.center, formData.range)

    await mongo.connect();
    const database = mongo.db(process.env.DATABASE);
    const collection = database.collection("Scenes");
    let createdScene = await collection.insertOne(created);
    console.log(createdScene)

    let newMetadata = await auth0Manager.getUser({id: formData.user.sub});
    if(newMetadata.hasOwnProperty("app_metadata")) {
        newMetadata = newMetadata.app_metadata;
    } else {
        newMetadata = {}
    }
    
    console.log(newMetadata)
    
    if(!newMetadata.hasOwnProperty("Scenes")) {
        newMetadata.Scenes = []
    }

    if(!newMetadata.hasOwnProperty("preferredScene")) {
        console.log("adding preferred")
        newMetadata.preferredScene = createdScene.insertedId
    }

    newMetadata.Scenes.push(createdScene.insertedId);

    await auth0Manager.updateAppMetadata({id: formData.user.sub}, newMetadata);
    console.log("success!");
}

async function get_locality(req, res) {
    res.send(await fetchReverseGeocode(...req.params.latlng.split(","))) // this is just so we can send geocode info from our own api without exposing secrets
    // also if I move away from google geocode services everything's in one place
    console.log(req.params.latlng)
}

module.exports = {
    create,
    get_locality
}