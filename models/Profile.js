const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    company: { type: String },
    website: { type: String },
    location: { type: String },
    status: { type: String, required: true },
    skills: { type: [String], required: true },
    bio: { type: String },
    githubusername: { type: String },
    experience: [ //array of {experience} objects
        {
            title: { type: String, required: true },
            company: { type: String, required: true },
            location: { type: String },
            from: { type: Date, required: true },
            to: { type: Date, required: true },
            current: { type: Boolean, default: false },
            description: { type: String }
        }
    ],
    education: [ //array of {education} objects
        {
            school: { type: String, required: true },
            degree: { type: String, required: true },
            fieldofstudy: { type: String, required: true },
            from: { type: Date, required: true },
            to: { type: Date },
            current: { type: Boolean, default: false },
            description: { type: String }
        }
    ],
    social: { //object of social media links
        youtube: { type: String },
        twitter: { type: String },
        facebook: { type: String },
        linkedin: { type: String },
        instagram: { type: String },
    },
    date: { type: Date, default: Date.now }
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;