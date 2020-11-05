const express = require('express');
const { PORT } = require('./config');
const connectDB = require('./config/db');
const usersRouter = require('./Routes/api/users');
const authRouter = require('./Routes/api/auth');
const postsRouter = require('./Routes/api/posts');
const profileRouter = require('./Routes/api/profile');

const app = express();

//connect Database
connectDB();

//Init MIddleware
app.use(express.json());

//Define Routes
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/profile', profileRouter);

app.get('/', (req, res) => {
    res.send('API RUNNING!!');
})



app.listen(PORT, () => console.log(`server is listening at port ${PORT}.`))