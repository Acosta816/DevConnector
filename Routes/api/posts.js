const express = require('express');
const router = express.Router();

//@route:    GET api/posts
// @desc:    Test route
// @access:  Public
router.get('/', (req, res) => {
    res.json({ "message": "HELLO, youve reached 'posts' route!!!" }).end();
});


module.exports = router;