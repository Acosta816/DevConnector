const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');//auth middleware adds the user's object id to req.user property in the req object. use req.user.id to query by id.
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route:    GET api/profile/me
// @desc:    Get current user's profile based on the user id that's in the token
// @access:  PRIVATE
router.get('/me', auth, async (req, res) => {

    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']); //querying for a specific profile based on the user property on the profile. We also pre-populate the user property with 'name' and 'avatar'. could have also done populate('user').easyRead();

        if (!profile) {
            return res.status(400).json({ message: 'No profile for this user' }).end();
        }

        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error, whoopsie');
    }

});

//@route:    POST api/profile
// @desc:    Create or update a user's profile (!!!Split this up so that updating occurs in PUT endpoint)
// @access:  PRIVATE
router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { company, website, location, bio, status, githubusername, skills, youtube, twitter, instagram, facebook, linkedin } = req.body;
    const allPossibleFields = ["company", "website", "location", "bio", 'status', 'githubusername', 'skills', 'youtube', 'twitter', 'instagram', 'facebook', 'linkedin'];

    //Build profile object 
    const profileFields = {};
    profileFields.user = req.user.id;
    allPossibleFields.forEach(field => {
        if (field === 'skills') {
            profileFields[field] = req.body.skills.split(',').map(skill => skill.trim());
        } else if (allPossibleFields.includes(field, 7)) { //if the field in allPossibleFields is one of the fields from index 7 and onward, then we check if that field even exists in req.body
            if (req.body[field]) {//if that field DOES exist in req.body, then we check if our profileFields has a social:{} object yet..
                if (!profileFields.social) {
                    console.log(`missing social for adding ${field}. I'll make one now. `)
                    profileFields.social = {};//if it doesn't, then we add one.
                }
                if (profileFields.social) {//if it does have a social:{} object, then we simply add some properties to social that came from our req.body's matching field.
                    console.log(`Looks like we have a social now, lets add ${field}`)
                    profileFields.social[field] = req.body[field];
                }
            }

        }
        else if (req.body[field]) {
            profileFields[field] = req.body[field];
        }
    });
    console.log(profileFields)
    res.json(profileFields);

})

module.exports = router;