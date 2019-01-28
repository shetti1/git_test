var mongoose = require('mongoose');
var Schema = mongoose.Schema; 
//This schema inserts username,phone_number,password into login schema
var loginschema = new Schema({
  username    : String,
  phone_number:{
    type:Number,
    unique:true,
  },
   password   : String 
});

var User = mongoose.model("login",loginschema);
module.exports = User;