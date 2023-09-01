const axios = require("axios");

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

    let created = new Scene(name, formData.user.sub, formData.center, formData.range);
    
    try {
        const database = mongo.db(process.env.DATABASE);
        const collection = database.collection("Scenes");
        const result = await collection.insertOne(created);

        console.log(result);
    } finally {
        await mongo.close();
    }
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