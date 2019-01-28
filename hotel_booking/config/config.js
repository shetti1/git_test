var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/hotelReservation');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("mongodb started");
});

module.exports = {

  'secret': 'ilovescotchyscotch',
  'database':'mongodb://localhost/hotelReservation'

};