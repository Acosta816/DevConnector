const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/default.json');

const User = require('../../models/User');

//@route:    GET api/users
// @desc:    Test route
// @access:  Public
router.get('/', (req, res) => {
    res.json({ "message": "HELLO, youve reached 'users' route!!!" }).end();
});

//@route:    POST api/users
// @desc:    Register new user
// @access:  Public
router.post('/', [
    check('name', 'Name is required yo.')
        .not()
        .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { name, email, password } = req.body;

        //#1:Check if user already exists, //#2:Get users gravatar, //#3:Encrypt password, #4://Persist user to DB, //#5:Return JWT (to login)
        //checking if user already exists
        try {
            let user = await User.findOne({ email }); //(await for this query to finish, then continue down the lines of code...)
            if (user) {
                return res.status(400).json({ errors: [{ message: 'User already exists' }] });
            }

            const avatar = gravatar.url(email, { //aquiring the user's avatar using 'gravatar' library taking the email and some options.
                s: '200',//default avatar size
                r: 'pg', //content rating(no nudes or violent or nazis)
                d: 'mm' //default image of blank sillouette if no avatar,(could also do 404 not found but the sillouette looks much better)
            });

            //create user (this is the same thing as basically saying const user = User.create({name etc...})) except this does NOT save to database. 
            //It just creates an instance of a user using the User model but does NOT persist in a database yet. Only create does that.
            user = new User({
                name,
                email,
                avatar,
                password
            });

            //Encrypt the new user's password.
            //Salt the password
            const salt = await bycrypt.genSalt(10); //(wait for the salt to generate, then continue down the lines of code...)
            //hash the password
            user.password = await bycrypt.hash(password, salt); //hashes the password adding the salt to it, encrypting it. (await for the password to be hashed, then continue down the lines of code...)

            await user.save();//THIS actually persists to the db layer.

            //Return JWT so user can log in. ==> JWTdebugger(https://jwt.io/) <==
            const payload = {
                user: {
                    id: user.id //even though mongoDB uses "_id", mongoose abstracts that with just .id and does same thing. nice.
                }
            };

            jwt.sign(payload, config.jwtSecret, { expiresIn: 360000 }, (err, token) => {
                if (err) throw err;
                res.json({ token });
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message, message: 'Something went wrong on our end, whoopsie ;/' }).end();
        }


    });


module.exports = router;