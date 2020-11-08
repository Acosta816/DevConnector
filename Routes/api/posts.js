const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route:    POST api/posts
// @desc:    CREATE a post 
// @access:  PRIVATE
router.post('/', [auth, [check('text', 'Text is required').not().isEmpty()]],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findById(req.user.id).select('-password');
            console.log(user);

            const newPost = new Post({
                text: req.body.text,//comes from the req.body
                name: user.name,    //comes from the user object we queried above (user).
                avatar: user.avatar, //comes from user object above.
                user: req.user.id    //could grab this from the req.user provided by auth middleware or we could get it from user we queried above.
            });

            const post = await newPost.save();

            res.status(201).json(post);

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error dude.')
        }
    });//end of POST /posts



//@route:    GET api/posts
// @desc:    GET all posts 
// @access:  PRIVATE
router.get('/', auth, (req, res) => {
    try {
        Post.find().sort({ date: -1 })
            .then(posts => {
                res.status(200).json({ count: posts.length, posts })
            })
            .catch(err => {
                console.error(err.message);
                res.status(500).json({ error: "Yikes, something went wrong on our end dudes.", details: err });
                res.end();
            });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error dude.");
    }
});//end of GET /posts



//@route:    GET api/posts/:postId
// @desc:    GET a post by id 
// @access:  PRIVATE
//@TODO: Modify the route to use filter query params like we did in the blogful-v2 search.
router.get('/:postId', auth, (req, res) => {
    try {
        Post.findById(req.params.postId)
            .then(post => {
                if (!post) {
                    return res.status(400).send('No post found').end();
                }
                res.status(200).json(post)
            })
            .catch(err => {
                console.error(err.message);
                if (err.kind === 'ObjectId') {
                    return res.status(400).json({ error: "Yikes, no post found.", details: err }).end();
                }
                res.status(500).json({ error: "Yikes, something went wrong on our end dudes.", details: err });
                res.end();
            });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).send('No post found').end();
        }
        res.status(500).send("Server Error dude.");
    }
});//end of GET /:postId



//@route:    GET api/posts/:postId
// @desc:    GET a post by id 
// @access:  PRIVATE
//@TODO: Modify the route to use filter query params like we did in the blogful-v2 search.
router.delete('/:postId', auth, (req, res) => {
    try {
        Post.findById(req.params.postId)
            .then(post => {
                if (!post) {
                    return res.status(400).send('NO post by that id, check the url');
                }
                if (post.user.toString() !== req.user.id) {
                    return res.status(401).json({ message: 'User is not authorized to delete THAT post' })
                }
                console.log(`Ok Deleting Post with id of: ${post.id}`)
                Post.findByIdAndRemove(post.id)
                    .then(r => {
                        return res.status(200).send(`Successfully Deleted Post with id of: ${post.id}`).end();
                    });
            })
            .catch(err => {
                console.error(err.message);
                if (err.kind === 'ObjectId') {
                    return res.status(400).json({ error: "Yikes, no post found.", details: err }).end();
                }
                return res.status(500).json({ error: "Yikes, something went wrong on our end dudes.", details: err });

            });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).send('No post found').end();
        }
        return res.status(500).send("Server Error dude.");
    }
});//end of Delete /:postId



//@route:    PUT api/posts/like/:postId
// @desc:    Like a post by id 
// @access:  PRIVATE
router.put('/like/:postId', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ message: 'Post already liked' });
        }

        post.likes.unshift({ user: req.user.id });

        await post.save();

        return res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
});//end of PUT /like/:id



//@route:    PUT api/posts/unlike/:postId
// @desc:    Unlike a post by id 
// @access:  PRIVATE
router.put('/unlike/:postId', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ message: 'Post Has not yet been liked' });
        }

        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);
        await post.save();

        return res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
});//end of PUT /unlike/:id               (delete like)



//@route:    POST api/posts/comment/:postId
// @desc:    Comment on a post 
// @access:  PRIVATE
router.post('/comments/:postId', [auth, [check('text', 'Text is required').not().isEmpty()]],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findById(req.user.id).select('-password');
            const post = await Post.findById(req.params.postId);

            const newComment = {
                text: req.body.text,//comes from the req.body
                name: user.name,    //comes from the user object we queried above (user).
                avatar: user.avatar, //comes from user object above.
                user: req.user.id    //could grab this from the req.user provided by auth middleware or we could get it from user we queried above.
            };

            post.comments.unshift(newComment);

            await post.save();

            res.status(201).json(post.comments);

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error dude.')
        }
    });//end of POST comment



//@route:    DELETE api/posts/comment/:postId/:commentId
// @desc:    Delete a comment 
// @access:  PRIVATE
router.delete('/comments/:postId/:commentId', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        //pull out comment
        const comment = post.comments.find(comment => comment.id === req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: `No Comment with id of:  ${req.params.commentId}` });
        }
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }
        //[creates an array of userId Strings] then we attach .indexOf() to the array of userIds
        const removeIndex = await post.comments.map(comm => comm.id.toString()).indexOf(req.params.commentId);
        console.log(removeIndex);
        await post.comments.splice(removeIndex, 1);
        await post.save();

        return res.json(post.comments);


    } catch (err) {
        console.error(err.message);
    }
});//end of DELETE comment

module.exports = router;