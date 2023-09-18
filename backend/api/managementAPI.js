const { ManagementClient } = require("auth0");

auth0Manager = new ManagementClient({
    domain: "punkmade.us.auth0.com",
    clientId: "8cB5z4qzJH5tbI3bjlE7HhczPmUQNveu",
    clientSecret: process.env.AUTH0_CLIENT_SECRET
})

module.exports = auth0Manager;