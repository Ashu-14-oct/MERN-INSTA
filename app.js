const express = require('express');
const PORT = process.env.PORT || 8000;
const app = express();
const cors = require('cors');
const mongodb = require('./config/mongoose');
const path = require('path');

//middleware
app.use(cors());
app.use(express.json());

//routes
app.use('/', require('./routes/index'));

//serving frontend
app.use(express.static(path.join(__dirname, "./frontend/build")));

app.get("*", (req, res) => {
    res.sendFile(
        path.join(__dirname, "./frontend/build/index.html"),
        function(err){
            res.status(500).send(err);
        }
    )
})

//listening on port
app.listen(PORT, (err) => {
    if(err){
        console.log(err);
    }
    else {
        console.log(`server running on port ${PORT}`);
    }
});