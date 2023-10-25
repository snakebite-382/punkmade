const neo4j = require('neo4j-driver');

function getDriver() {
    const URI = process.env.DB_URI
    const USER = 'neo4j'
    const PASSWORD = process.env.DB_PASSWORD
    let driver

    try {
        driver = neo4j.driver(URI,  neo4j.auth.basic(USER, PASSWORD))
        console.log("DB CONNECTED")
    } catch(err) {
        console.log(`Connection error\n${err}\nCause: ${err.cause}`)
        driver = false;
    }  
    return driver
}

const dbDriver = getDriver()

module.exports = {
    dbDriver
}