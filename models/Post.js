const mongoose = require('mongoose');


const postSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    text: { type: String, required: true },
    name: { type: String },//user name (extracting the name here in case the user is deleted we can still show the name of the user here without having to dig into the users db )
    avatar: { type: String },
    likes: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' } }],
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        text: { type: String, required: true },
        name: { type: String },
        avatar: { type: String },
        date: { type: Date, default: Date.now() }
    }],
    date: { type: Date, default: Date.now() }
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;