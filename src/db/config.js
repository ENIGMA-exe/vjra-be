require('dotenv').config();
const mongoose = require('mongoose');

//database:- test;
const mongo_connection = ()=>{
    const DV_URL = "mongodb://localhost:27017/Pokemon";
    //process.env.MY_DB_URL
    mongoose.connect(DV_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true
        // useFindAndModify:false,
        // useCreateIndex:true
        }).then(() => {
            console.log('connection successfull');
        }).catch((err) => {
            console.log('error in connection');
            console.log(err);
        });
}

module.exports = mongo_connection;