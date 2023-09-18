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
        // the most relevant name is the first address of the first result, and we want the shorthand name\
        console.log(result.data.features[0].properties.city)
        locality = result.data.features[0].properties.city
    }).catch(e => {
        console.log(e)
    })

    return {locality};
}

async function create(req, res) {
    const formData = req.body
    console.log(formData)

    let name = await fetchReverseGeocode(...formData.center); 
    name = name.locality + " Punk"

    let created = new Scene(name, formData.user, formData.center, formData.range)

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
    res.send(JSON.stringify(true))
}

async function get_locality(req, res) {
    let latLng = req.params.latlng.split(",")
    res.send(await fetchReverseGeocode(...latLng)) // this is just so we can send geocode info from our own api without exposing secrets
}

module.exports = {
    create,
    get_locality
}