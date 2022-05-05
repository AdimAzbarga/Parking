 //jshint esversion:6
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}


const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
var passport = require("passport");
const bcrypt = require("bcrypt");
//const flash = require("express-flash");
const flash = require("connect-flash");
const session = require("express-session");
var passwordValidator = require('password-validator');
//var foo = require('./foo.js');
//var bar = require('../lib/bar.js');
//var gamma = require('gamma');

const aboutContent = "Find Parking ..";


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())


mongoose.connect("mongodb://localhost:27017/UserDB", {
  useNewUrlParser: true
});

//parking model
const parkingSchema = {
  title: {
    type: String,
      //required: [false, "Please enter a Title."],
      unique: true
  },
  description : String,
  address: String,
  type: String,
  status: String,
  price: String
};
const Parking = mongoose.model("Parking", parkingSchema);


//users models



const usersSchema = {
  userName: String,
  email: String,
  password: String,
  phone: String,
  isOwner: String,
  isCustomer: String,
  isAdmin: String
};

const User = mongoose.model("User", usersSchema);


var passwordschema = new passwordValidator();
var phoneschema = new passwordValidator();
var usernameschema = new passwordValidator();

// Add properties to it
passwordschema
  .is().max(15) // Maximum length 25
  .has().uppercase() // Must have uppercase letters
  .has().digits(2) // Must have at least 2 digits
// Validate against a password string

phoneschema
  .is().min(10)
  .has().digits(10) // Minimum length 10


usernameschema
  .is().min(8) // Minimum length 10
  .is().max(15) // Maximum length 25
  .has().not().spaces() // Should not have spaces
  .has().lowercase() // Must have lowercase letters



app.get("/map", function(req, res) {
  res.render("map");

});


app.get("/sort", function(req ,res){
  res.render("sort");

});

app.post("/map", function(req, res) {
    Parking.find({address: req.body.place}, function(err, posts){
    res.render("sort" ,
    { result : posts
    });
  })
});


app.post("/available" , function(req , res){
   Parking.find({status : "Available"}, function(err , posts){
    res.render("sort", {
      result : posts
    });
  });
});

app.post("/unavailable" , function(req , res){
   Parking.find({status : "Unavailable" }, function(err , posts){
    res.render("sort", {
      result : posts
    });
  });
});

app.post("/regular" , function(req , res){
   Parking.find({status : "Regular" }, function(err , posts){
    res.render("sort", {
      result : posts
    });
  });
});

app.post("/disabled" , function(req , res){
   Parking.find({type : "Disabled" }, function(err , posts){
    res.render("sort", {
      result : posts
    });
  });
});


app.get("/", function(req, res) {
  res.render("homepage");
});

app.get("/parkings", function(req, res) {

  Parking.find({}, function(err, posts) {
    res.render("parkings", {
      posts: posts
    });

  });
});

app.get("/ownerPage", function(req, res) {

  Parking.find({}, function(err, posts) {
    res.render("ownerPage", {
      posts: posts
    });

  });
});

app.get("/compose", function(req, res) {
  res.render("compose");
});

app.get("/signup", function(req, res) {
  res.render("signup", {
    message: req.flash("message")
  });
});



app.post('/login', function(req, res) {
  const password = req.body.password;
  User.findOne({
    userName: req.body.username,

  }, function(err, user) {
    if (err) {
      res.json({
        error: err
      })
    }
    if (user) {
      if (req.body.password === user.password) {

        if (user.isOwner === "on") {
          res.redirect("/ownerPage");
        } else if (user.isAdmin === "on") {
          res.redirect("/adminPage");
        } else {
          res.redirect("/customerPage");
        }
      } else {
        req.flash("message", "paswword not match!");
        res.redirect("/login");
      }
    } else {
      req.flash("message", "user not found !");
      res.redirect("/login");
    }
  });
});


app.post('/signup', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    let users = new User({
      userName: req.body.username,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
      isOwner: req.body.isOwner,
      isCustomer: req.body.isCustomer,

    });
    User.findOne({
      userName: req.body.username,

    }, function(err, user) {
      if (err) {
        res.json({
          error: err
        })
      }
      if (!user) {
        if (passwordschema.validate(req.body.password)) {
          if (usernameschema.validate(req.body.username)) {
            if (phoneschema.validate(req.body.phone)) {
              users.save(function(err) {
                if (!err) {
                  res.redirect("/login");
                }
              });
            } else {
              req.flash("message", "The phone should have a length of 10 digits of numbers");
              res.redirect("/signup");
            }
          } else {
            req.flash("message", "The username should have a  Min length 8 and max 10 , no space , lowcase");
            res.redirect("/signup");
          }

        } else {
          req.flash("message", "the password should have a max length of 15 characters, min of 1 uppercase letter and minimum of 2 digits");
          res.redirect("/signup");
        };

      } else {
        req.flash("message", "the user is already exist!");
        res.redirect("/signup");
      }
    });


  } catch {
    res.redirect('/signup')
  }
});



app.get("/login", function(req, res) {
  res.render("login", {
    message: req.flash("message")
  });
});

app.get("/ownerPage", function(req, res) {
  res.render("ownerPage");
});


app.get("/customerPage", function(req, res) {
  res.render("customerPage");
});


app.get("/adminPage", function(req, res) {
  res.render("adminPage");
});


app.get('/users', function(req, res) {
  User.find({}, function(err, foundUser) {
    res.render("users", {
      users: foundUser
    });

  });
});



app.post("/compose", function(req, res) {
  let post = new Parking({

    title: req.body.postTitle,
    description : req.body.postDescription,
    address: req.body.place,
    type: req.body.postType,
    status: req.body.postStatus,
    price: req.body.postPrice
  });


  post.save(function(err) {
    if (!err) {
      res.redirect("ownerPage");
    }
  });
});

app.post("/delete", function(req, res) {
  const deleted = req.body.deleting;
  console.log(deleted);
  User.findByIdAndRemove(deleted, function(err) {
    if (!err) {
      console.log("successfuly deleting cheked Item");
    }
  });
  res.redirect("users");
});


app.get("/posts/:postId", function(req, res) {

  const requestedPostId = req.params.postId;

  Parking.findOne({
    _id: requestedPostId
  }, function(err, post) {
    res.render("post", {
      description : post.description,
      title: post.title,
      address: post.address,
      type: post.type,
      status: post.status,
      price: post.price

    });
  });

});

app.get("/about", function(req, res) {
  res.render("about", {
    aboutContent: aboutContent
  });
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/home')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/home')
  }
  next()
}




app.listen(3000, function() {
  console.log("Server started on port 3000");
});
