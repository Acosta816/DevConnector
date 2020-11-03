const express = require('express');
const { PORT } = require('./config');

const app = express();

app.get('/', (req, res) => {
    res.send('API RUNNING!!');
})



app.listen(PORT, () => console.log(`server is listening at port ${PORT}.`))