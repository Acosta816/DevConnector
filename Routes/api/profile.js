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
            return res.status(400).json({ message: 'Token is good, just looks like that user does not have a profile yet.', details: ' Create a new profile by POSTing at profile/ using this same token in the x-auth-token header. Include the profile fields in the body.' }).end();
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
    });//end of profileFields.forEach()

    console.log(profileFields)
    console.log(req.user);
    console.log(req.body);

    //Now we create or update our profile.
    try {
        let userProfile = await Profile.findOne({ user: req.user.id });
        if (userProfile) {
            //update
            console.log('we found the profile, lets update it.')
            userProfile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
            return res.status(200).json(userProfile).end();
        }
        else if (!userProfile) {
            console.log('No profile found for this user, lets MAKE ONE!')
            userProfile = await Profile.create(profileFields);
            return res.status(201).json(userProfile);
        }
    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message }).end();
    }


    res.json(profileFields);

});//end of POST /


//@route:    GET api/profile
// @desc:    GET all existing profiles in db
// @access:  Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.status(200).json({ count: profiles.length, profiles: profiles });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error man');
    }
});//end of GET all profiles


//@route:    GET api/profile/user/:userId
// @desc:    GET specific profile (not user data) based on user database id (not profile db id).
// @access:  Public
router.get('/user/:userId', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.userId }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).send('No profile for that user id. perhaps check the id.').end();
        }
        return res.status(200).json({ profile });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).send('No profile for that user id. Perhaps check the id.').end();
        }
        res.status(500).send('Server Error man');
    }
});//End of Get /user/:userId 



//@route:    DELETE api/profile
// @desc:    DELETE specific profile, user, and all posts by user.
// @access:  PRIVATE
router.delete('/', auth, async (req, res) => {
    try {
        //@TODO - remove user's posts

        //Removes profile
        await Profile.findOneAndRemove({ user: req.user.id });
        //Removes the user
        await User.findByIdAndRemove(req.user.id);

        return res.status(200).json({ msg: 'User removed, and profile removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error man');
    }
});//End of DELETE /



//@route:    PUT api/profile/experience
// @desc:    Update/add profile experience
// @access:  PRIVATE
router.put('/experience', [auth, [
    check('title', 'Title is required')
        .not()
        .isEmpty(),
    check('company', 'Company is required')
        .not()
        .isEmpty(),
    check('from', 'from date is required')
        .not()
        .isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, company, location, from, to, current, description } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    };

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.experience.unshift(newExp);

        await profile.save();

        return res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error mann')
    }

});//end of PUT experience



//@route:    PUT api/profile/experience/:expId
// @desc:    DELETE one profile experience
// @access:  PRIVATE
router.delete('/experience/:expId', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        //get the experience to delete.
        let removeIndex;
        const expToRemove = profile.experience.find((exp, i) => {
            exp.id === req.params.expId ? removeIndex = i : null
            return exp.id === req.params.expId //we only needed the index but i captured the experience to be removed just for debugging purposes.
        });
        console.log(removeIndex);
        console.log(expToRemove);

        profile.experience.splice(removeIndex, 1);
        await profile.save();//saving the modified profile.
        return res.status(200).json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error').end();
    }
});//end of DELETE experience/:expId



// *******************************************BEGIN of Education***********************************************

//@route:    PUT api/profile/education
// @desc:    Update/add profile education
// @access:  PRIVATE
router.put('/education', [auth, [
    check('school', 'school is required')
        .not()
        .isEmpty(),
    check('degree', 'degree is required')
        .not()
        .isEmpty(),
    check('fieldofstudy', 'fieldofstudy is required')
        .not()
        .isEmpty(),
    check('from', 'from date is required')
        .not()
        .isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { school, degree, fieldofstudy, from, to, current, description } = req.body;

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    };

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.education.unshift(newEdu);

        await profile.save();

        return res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error mann')
    }

});//end of PUT education



//@route:    PUT api/profile/education/:edId
// @desc:    DELETE one profile education from education array
// @access:  PRIVATE
router.delete('/education/:eduId', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        //get the education to delete.
        let removeIndex;
        const edToRemove = await profile.education.find((ed, i) => {
            if (ed.id === req.params.eduId) {
                removeIndex = i
            }
            return ed.id === req.params.eduId //we only needed the index but i captured the experience to be removed just for debugging purposes.
        });
        console.log(edToRemove);

        if (!edToRemove) {
            return res.status(400).json({ message: "no education found by that id" }).end();
        }
        profile.education.splice(removeIndex, 1);

        await profile.save();//saving the modified profile.

        return res.status(200).json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error').end();
    }
});//End of DELETE education

module.exports = router;