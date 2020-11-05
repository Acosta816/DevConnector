const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true, //makes the deprecated warnings go away
            useUnifiedTopology: true, //makes the deprecated warnings go away
            useCreateIndex: true //makes deprecation error go away
        });

        console.log('MongoDB connected through mongoose...');
    } catch (err) {
        console.error(err.message);
        // Exit process with failure
        process.exit(1);
    }
}

module.exports = connectDB;