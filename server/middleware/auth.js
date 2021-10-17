
const express = require('express');
const app = express();
var jwt = require('express-jwt');
var jwks = require('jwks-rsa');

// Authorization middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
module.exports = jwt({secret: jwks.expressJwtSecret({cache: true, rateLimit: true,jwksRequestsPerMinute: 5, jwksUri: 'https://muhammadumerchaudhary.us.auth0.com/.well-known/jwks.json'
}),audience: 'https://pickfun-auth',issuer: 'https://muhammadumerchaudhary.us.auth0.com/',algorithms: ['RS256']});

