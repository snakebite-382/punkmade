// imports
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');

// DOTENV
const dotEnv = require("dotenv");
dotEnv.config({path: __dirname + "/.env"})

// Setup the express app
const app = express();

// runtime constants 
const frontendDir = __dirname + "/frontend/build";
const port = process.env.port || 5000;
const mongoUri = process.env.MONGO_URI;

// connect DB
const mongoOptions = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }    
}

const mongo = new MongoClient(mongoUri, mongoOptions);
mongo.connect().then(
    console.log("DB CONNECTED")
);

// static files
app.use(express.static(frontendDir));

// redirect all requests to the frontend
app.get('/', (request, response) => {
    response.sendFile(frontendDir + "/index.html");
});

// listen for requests :)
app.listen(port, () => {
    console.log('Your app is listening on port ' + port);
});

mongo.close();