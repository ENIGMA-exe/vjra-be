const mongoose = require('mongoose');
const validator = require('validator');
const bc = require('bcrypt');

//schema
const ud_schema = mongoose.Schema({
    user_id:{
        type:String,
        default:"user_"
    },
    name:{
        type:String,
        require:[true,'no fname found']
    },
    email:{
        type:String,
        require:[true,'no email found'],
        unique:true,
        validator(value){
            if(!validator.isEmail(value)){
                throw new Error('invalid Email Id');
            };
        }
    },
    pwd:{
        type:String,
        require:[true,'password must be there.']
    },
    favourite:{type:Array,default:[]},
    
});

ud_schema.pre("save",async function(next){
    if(this.isModified("pwd")){
        this.pwd = await bc.hash(this.pwd,10);
    }
    next();
})

const user_detail = mongoose.model('user detail',ud_schema);

module.exports = user_detail;