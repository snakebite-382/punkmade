const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoUri = process.env.MONGO_URI;

const mongoOptions = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }    
}

const mongo = new MongoClient(mongoUri, mongoOptions);

module.exports = {
    mongo
}