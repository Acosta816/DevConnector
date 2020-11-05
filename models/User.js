const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: { type: String, required: true },
    avatar: { type: String },
    date: { type: Date, default: Date.now }
});


UserSchema.methods.easyRead = function () {
    return {
        id: this.id,
        name: this.name,
        email: this.email,
        avatar: this.avatar,
        date: this.date
    }
};



const User = mongoose.model('User', UserSchema);

module.exports = User;