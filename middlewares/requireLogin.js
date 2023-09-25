const jwt = require('jsonwebtoken');
const {jwt_secret} = require('../keys');
const mongoose = require('mongoose');
const User = require('../models/userSchema');

module.exports = (req, res, next) => {
    const {authorization} = req.headers;
    // console.log(authorization);
    if(!authorization){
        return res.status(401).json({error: "You must be logged in"});
    }
    const token = authorization.replace("Bearer ", "");
    jwt.verify(token, jwt_secret, (err, payload) => {
        if(err){
            return res.status(401).json({error: err});
        }
        const {_id} = payload;
        User.findById(_id).then(userData => {
            req.user = userData;
            next();
        })
    });
    // return res.status(200).json({message: "post created!"})
}