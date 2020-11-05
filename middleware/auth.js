const jwt = require('jsonwebtoken');
const config = require('../config/default.json');

//The user's request will pass through this middleware where we will manipulate it by giving it some authorization properties granted 
//they have the right value in their 'x-auth-token' header.

//We will look at their req.header called x-auth-token to see if they have the raw jwtoken that was given to them apon first creating their user whenever that was.
//We assign that to a const named userToken to work with more easily.
//We Check if the token is VALID using jwt.verify() and pass in the raw userToken AND the secret that only WE have in the server.
//This also decodes it at the same time so we assign the decoded value to a property called user that we also are just now making 
//called "user". (req.user = decodedToken.user)
//Now the client request object has a property called user which holds the decoded object id of the user stored in mongodb atlas.
//Remember the jwt looks like this: { user: { id: 1232456asldjfkansdifu005e }}   


module.exports = function (req, res, next) {
    //Check if no token
    if (!req.header('x-auth-token')) {
        return res.status(401).json({ msg: 'No token, authorizatinon denied, sorry.' });
    }

    //Get token from req header
    const userToken = req.header('x-auth-token');

    //Verify the token
    try {
        const decodedToken = jwt.verify(userToken, config.jwtSecret);
        req.user = decodedToken.user;
        next();
    }
    catch (err) {
        console.error(err);
        res.status(401).json({ msg: 'token verification failed. ', error: err }).end();
    }
}