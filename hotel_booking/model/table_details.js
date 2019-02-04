var mongoose = require('mongoose');
var Schema = mongoose.Schema; 
//This schema inserts seat_capacity,no_of_tables,table_availability into table schema
var table_details = new Schema({
  seat_capacity   :Number,
    no_of_tables : Number,
  table_availability:Boolean,
 
});
var Table = mongoose.model("table",table_details);
module.exports = Table;