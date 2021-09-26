const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');

const user = require('./src/models/ud_model');
const API = require('./src/models/api_model');

const port = process.env.PORT || 3131;

//db
const mongo_conn = require('./src/db/config.js');
mongo_conn();


const app = express();

app.use(express.json());
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ..........................API END POINT.............................

app.get('/', (req, res) => {
    res.send("welcome");
})
// ..........................API-DETAILS END POINT.............................

app.get('/api',async(req,res)=>{
    try {
        var result = await API.find();

        if(result.length == 0){
             await new API(req.body).save();
             var result = await API.find();
             res.status(200).send(result);
        }else{
            res.status(200).send(result);
        }
    } catch (error) {
        res.status(417).send(error);
    }
});

app.get('/api/:temp',async(req,res)=>{

    try {
        switch(req.params.temp){

            case "total_user":
                await API.find({},(err,arr)=>{
                    var result = arr.map((data)=>{
                        return data.total_user
                    })
                    res.status(200).send(result);
                });break;

            case "total_movies":
                await API.find({},(err,arr)=>{
                    var result = arr.map((data)=>{
                        return data.total_movies
                    })
                    res.status(200).send(result);
                });break;

            case "total_series":
                await API.find({},(err,arr)=>{
                    var result = arr.map((data)=>{
                        return data.total_series
                    })
                    res.status(200).send(result);
                });break;
            default:
                res.status(404).send("path not found") 
        }
    } catch (error) {
        res.status(422).send(error)
    }
    
})

app.post('/api', async(req,res)=>{
    try {
        var result = await API.find();

        if( result == 0){
            var result = await new API(req.body).save();
            res.status(201).send(result);
        }else{
            res.status(200).send(await API.find());
        }
        
    } catch (error) {
        //422 = Unprocessable Entity
        res.status(422).send(error);
    }
})

app.post('/api/add_admins', async(req,res)=>{
    try {
        var result = await API.updateOne(
            {id:"API_POTATO_01"},
            {$push:{admins:req.body}}
        )
        res.status(201).send(result);
    } catch (error) {
        res.status(422).send(error);
    }
})

// ..........................USER END POINT.............................

//.................GEST USER DATA.........................
app.get('/user_details', async (req, res) => {
    try {
        var result = await user.find();
        res.status(201).send(result);
    } catch (error) {
        //400:- bad request
        res.status(400).send(error);
    }
})

//...............RESGISTER USER DATA.........................
app.post('/user_details', async (req, res) => {
    try {

        var user_data = new user(req.body);


        var api_detail = await API.find();
        api_detail.map(async (api_data) => {

            user_data.user_id = user_data.user_id + (api_data.total_user + 1).toString();
            // console.log(user_data);

            await user_data.save(async (err, result) => {
                if (err) {
                    if (err.name == 'MongoError' && err.code == 11000) {
                        return res.status(422).send('Email Already Exist');
                    }
                    return res.status(422).send("line"+err);
                } 
            });
        })
        await API.updateOne({ id: "API_HARBOUR_01" }, { $set: { total_user: api_detail[0].total_user + 1 } });
        res.status(201).send('saved successfully \n');
        

    } catch (error) {
        //422 = Unprocessable Entity
        res.status(422).send('error in saving \n' + error);
    }
})

//...............PUSH USER POST.........................

app.post('/post/:userid', async (req,res)=>{
    try {
        await user.updateOne(
            {user_id:req.params.userid},
            {$push:{post:req.body}}
        )
        res.status(201).send(`post added successfully`)
    } catch (err) {
        res.status(400).send('error in post added \n'+err);
    }
})

//...............FIND USER BASED ON LOCATION.........................
app.get('/location/:place', async(req,res)=>{
    try {
        var result = await user.find().elemMatch("post",{"location":req.params.place});
        res.status(200).send(result)
    } catch (err) {
        res.status(400).send('error in found \n'+err);
    }
    
})
//...............FIND USER BASED ON ID.........................
app.get('/user/:id',async(req,res)=>{
    try {
        var result = await user.findOne({user_id:req.params.id})
        res.status(200).send(result)
    } catch (err) {
        res.status(400).send(err);
    }
    
})

//.................USER LOGIN.....................................
app.post('/user/login',async(req,res)=>{
    // console.log(req.body);

    var result = await user.find({email:req.body.email});
    // console.log(result[0]);
    if(result.length != 0){
        bcrypt.compare(req.body.pwd, result[0].pwd, (err, data) => {
            // res == true or res == false
            if(err){
                res.send(result[0].user_id);
            }else{res.send(data);}
        })
    }else{
        res.send('invalid')
    }
})






app.listen(port, (req, res) => {
    // console.log(`server running @ localhost:${port}`)
})