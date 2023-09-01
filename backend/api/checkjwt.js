const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const dotenv = require('dotenv');
dotenv.config();

const domain = process.env.AUTH0_DOMAIN; // domain of issuer
const audience = process.env.AUTH0_AUDIENCE; // URL for api

// checker for JWT we just pass this into our get requests to verify them
const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${domain}/.well-known/jwks.json`,
    }),

    audience: audience,
    issuer: `https://${domain}/`,
    algorithms: ["RS256"],
});

module.exports = {
    checkJwt,
};