var express = require('express');
var app = express();
var bcrypt = require('bcrypt');
var BCRYPT_SALT_ROUNDS =10;
var bodyParser = require('body-parser');
require("./config/config.js");cd

let User = require("./model/loginschema");
let Table = require("./model/table_details")

let book_info = require("./model/book_info");
var uname;
let id;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config/config'); // get our config file
app.set('superSecret', config.secret); // secret variable

//to set path for external stylesheet

var publicdir = require('path').join(__dirname, '/public');
app.use(express.static(publicdir));
var mongoose = require('mongoose');

//To listen on port 4005
var port = 4005;

//body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

/**
 * To render the home page
 */
app.get('/home', function (req, res) {
  res.render('login');
})
app.get('/detail', function (req, res) {

  book_info.find({}, function (err, obj) {

    if (obj != null) {
      res.render('admindetails', { data: obj });
    }
    else {
      console.log("not obj");
    }
  })
});
/**
 * To save the details of the user for the first time (sign)
 */
app.post('/signuppage', function (req, res) {
 
  if (req.body.psw == req.body.password) {

    bcrypt.hash(req.body.psw, BCRYPT_SALT_ROUNDS)
      .then(function (hashedPassword) {
        var name = new User({
          username: req.body.name,
          phone_number: req.body.phone,
          password: hashedPassword
        })
        name.save();
      })
      .then(function () {
        res.json({ success: true });
      })
      .catch(function (error) {
        console.log("Error saving user: ");
        console.log(error);
      });
   

  }
  else {
    res.json({ success: false });
  }
})
/**
 * To render the signup page
 */
app.get('/signup', function (req, res) {
  res.render('signup');
})
/**
 * To render admindetails page
 */

app.get('/admindetails', function (req, res) {

  book_info.find({}, function (err, obj) {
    if (obj != null) {
      res.render('admindetails', { data: obj });
    }
  })
});
/**
 * To render the Login page
 */
  app.post('/login', function (req, res) {
    let _user;

    User.findOne({
      phone_number: req.body.phone,
    })
      .then(function (user) {
        _user = user;
        return bcrypt.compare(req.body.password, user.password);
      })
      .then(function (samePassword) {
        if (!samePassword) {
          res.json({ success: false, message: 'Authentication failed. Wrong password.' });
        }
        else {
          const payload = {
            admin: _user.username
          }
          id = _user._id;
          
          var token = jwt.sign(payload, app.get('superSecret'), {
            expiresIn: 1440 // expires in 24 hours
          });

          // return the information including token as JSON
          // console.log(req.body.name);
          if (_user.phone_number == '8904349542') {
            res.json({
              success: true,
              message: 'Enjoy your token!',
              token: token,
              name: 'admin'
            });
          }
          else {
            res.json({
              success: true,
              message: 'Enjoy your token!',
              token: token
            });
          }
        }
      })
      .catch(function (error) {
        res.json({ success: false, message: 'Authentication failed. User not found.' });
      });

  });
// });

/**
 * middleware  for token verification
 */
app.use('/', (req, res, next) => {
  var token = req.headers.token;
  console.log(token);

  if (token) {

    // verifies tokens
    jwt.verify(token, app.get('superSecret'), function (err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        res.locals.uname = decoded.admin;
        uname = decoded.admin
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });

  }

  /**to render home page */
})
app.get('/token', function (req, res) {
  res.render('home');
})


/**
 * to book seat page
 */
app.get('/book', function (req, res) {
  res.render('book_seat');
})

/**
 * to book seat and update no of seats in database
 */
app.post('/booking', function (req, res) {
  var seat = { seat_capacity: req.body.seat };
  Table.findOne(seat, function (err, obj) {
    if (obj != null) {
      if (obj.no_of_tables != 0) {
        //update no of seats in database
        Table.updateOne(seat, { $inc: { no_of_tables: -1 } }, function (err, obj) {
          if (err) throw err;
          else {
            var book = new book_info({
              user_id: id,
              user_name: uname,
              Date: req.body.date,
              no_of_seats: req.body.seat
            });
            book.save()
              .then(item => {

                res.render('confirmation');
              })
              .catch(err => {
                res.status(400).send("unable to save to database");
              })
          }
        })
      }
      else {
        Table.updateOne(seat, { table_availability: false }, function (err, obj) {
          res.json({ success: false });
        })
      }
    }
  });
})

// app.get('/page4', function (req, res) {

//   var table_details = new book_info({
//     user_name: "Prashant",
//     Date: 12 / 12 / 2018,
//     no_of_seats: 2

//   });
//   table_details.save()
//     .then(item => {

//       res.send("item saved to database");
//     })
//     .catch(err => {
//       res.status(400).send("unable to save to database");
//     });

// })

/**
 * to fetch the logged user booking details
 */
app.get('/viewdetails', function (req, res) {
  let uid = { user_id: id };
  book_info.find(uid, function (err, obj) {
    if (obj != null) {
      res.render('details', { data: obj });
    }
  })
});

/**
 * to render login page when user clicks logout button
 */
app.get('/logout', function (req, res) {
  res.render('login');
})
/**
 * to delete the booked seat
 */
app.delete('/delete', function (req, res) {
  let id = { _id: req.body.Id }
  book_info.findOne(id, function (err, obj) {
    if (obj != null) {
      let value = { seat_capacity: obj.no_of_seats };
      Table.updateOne(value, { $inc: { no_of_tables: +1 } }, function (err, obj2) {
        if (err) throw err;
        else {
          book_info.deleteOne(id, function (err, names) {
            if (err) throw err;
            else
              res.render('home');
          });

        }
      })
    }
  })
})
//

/**
 * to listen at particular port
 **/
app.listen(port);