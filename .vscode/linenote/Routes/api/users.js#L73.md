We want to pass the user ID as the payload for the JWT.
For jwt library, we need to do the following:

FIRST Sign the token with .sign() and pass in the payload (in this case our user's ID) as an object.

As a SECOND argument to .sign() we pass a "secret" that only lives on the server and is usually a hashed value. We will keep it in default.json file.

The THIRD argument is a callback function which returns the jwt back to the client so that they can log in.

jwt.sign({ userId: '123abc' }, 'secret', (err, token)=> {
    return token;
});

We then can create a piece of middleware that will verify the token when trying to reach particular routes to protect the routes using jwt.verify() passing in the token.