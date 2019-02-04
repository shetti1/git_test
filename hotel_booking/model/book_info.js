var mongoose = require('mongoose');
var Schema = mongoose.Schema; 
// This schema insert user_id,user_name,Date,no_of_seats into bookInfo collection
var book_info = new Schema({

  user_id: { type:Schema.Types.ObjectId, ref: 'User' },
  user_name: String,
  Date: String,
  no_of_seats: Number

});
var book_info = mongoose.model("bookInfo", book_info);
module.exports = book_info;