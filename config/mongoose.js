const mongoose = require('mongoose');
const {mongourl} = require('../keys');

mongoose.connect(mongourl);

const db = mongoose.connection.once("open", (err)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log("successfully connected to the mongoDB");
    }
});

module.exports = db;