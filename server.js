const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('API RUNNING!!');
})

const PORT = process.env.PORT || 8080;


app.listen(PORT, () => console.log(`server is listening at port ${PORT}.`))