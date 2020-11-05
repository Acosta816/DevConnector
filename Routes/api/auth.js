const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const config = require('../../config/default.json');//need this to validate user's jwt secret against our server "secret".
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');
const User = require('../../models/User');

//@route:    GET api/auth
// @desc:    Test route (can comment out later i guess but it provides a quick way of retreiving the json user data to see if they are in the db)
// @access:  Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json(user.easyRead());
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Looks like a Server error on our end. Our apologies.', error: err });
    }
    res.end();
});


//@route:    POST api/auth
// @desc:    Authenticate user and get token like we did when we created the user initially which we then use to access multiple routes. 
// @access:  Public
router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please include a valid password.').exists()
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { email, password } = req.body;

        //#1:Check if user already exists, //#2:Get users gravatar, //#3:Encrypt password, #4://Persist user to DB, //#5:Return JWT (to login)
        //checking if user already exists
        try {
            let user = await User.findOne({ email }); //(await for this query to finish, then continue down the lines of code...)
            if (!user) {
                return res.status(400).json({ errors: [{ message: 'No such user by that email' }] });
            }


            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'Invalid Password' }] });
            }

            // creating a payload so that the server can sign it using jwt.sign, passing in the payload. 
            // Then we'll Return JWT so user can log in. Use this jwt debugger to see the decoded version of the signed jsonwebtoken ==> JWTdebugger(https://jwt.io/) <==
            const payload = {
                user: {
                    id: user.id //even though mongoDB uses "_id", mongoose abstracts that with just .id and does same thing. nice.
                }
            };

            jwt.sign(payload, config.jwtSecret, { expiresIn: 360000 }, (err, token) => { //passing the payload which we made from the data we got back from qeuing the db using the user's email. Then we sign it and pass it back to the client.
                if (err) throw err;
                res.json({ token });
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message, message: 'Something went wrong on our end, whoopsie ;/' }).end();
        }


    });


module.exports = router;