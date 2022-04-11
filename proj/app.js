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
const flash = require("express-flash");
const session = require("express-session");




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



// parking datatbase
mongoose.connect("mongodb://localhost:27017/parkingDB", {
  useNewUrlParser: true
});

const parkingSchema = {
  title: String,
  address: String,
  type: String,
  status: String,
  price: String
};

const Post = mongoose.model("Post", parkingSchema);

//user database
mongoose.connect("mongodb://localhost:27017/UserDB", {
  useNewUrlParser: true
});

const usersSchema = {
  userName: String,
  email: String,
  password: String,
  phone: String,
  isOwner: String,
  isCustomer: String,
//  isAdmin:String
};

// const adminUser = new User({
//   userName: "ADMIN",
//   email: "adeem2azbarga@gmail.com",
//   password: "admin123",
//   phone: "050221133",
//   isOwner: "off",
//   isCustomer: "off",
//   isAdmin:"on"
// })
//
// const defultUser = adminUser;
//
// User.InsertOne(defultUser,function(err){
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log("saved successfully");
//   }
// })

const User = mongoose.model("User", usersSchema);
//
// const initializePassport = require("./passport-config");
// initializePassport(passport ,
//    email => User.find( user = User.email === email ),
//    id => User.find( user = User.id === id )
// );



app.get("/", function(req, res) {
  res.render("homepage");
});

app.get("/home", function(req, res) {

  Post.find({}, function(err, posts) {
    res.render("home", {
      posts: posts
    });
  });
});

app.get("/compose", function(req, res) {
  res.render("compose");
});

app.get("/signup", function(req, res) {
  res.render("signup");
});


app.post('/signup', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    let user = new User({
      userName: req.body.username,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
      isOwner: req.body.isOwner,
      isCustomer: req.body.isCustomer,
    });
    user.save(function(err) {
      if (!err) {
        res.redirect("/login");
      }
    });
  } catch {
    res.redirect('/signup')
  }
});

//
// app.post("/signup", function(req, res){
//   const user = new User({
//     userName: req.body.username,
//     email: req.body.email,
//     password:req.body.password,
//     isOwner: req.body.isOwner,
//     isCustomer:req.body.isCustomer,
//
//   });
//
//
//   user.save(function(err){
//     if (!err){
//         res.redirect("/login");
//     }
//
//   });
// });

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/ownerPage", function(req, res) {
  res.render("ownerPage");
});


app.get("/customerPage", function(req, res) {
  res.render("customerPage");
});




app.post('/login', function(req, res) {
  const password = req.body.password;
  User.findOne({
    userName: req.body.username,
    password: password

  }, function(err, user) {
    if (err) {
      res.json({
        error: err
      })
    }
    if (user) {
      if(user.isOwner === "on"){
        res.redirect("/ownerPage");
      }
      if(user.isCustomer === "on"){
        res.redirect("/customerPage");
      }

    }
    else {
      res.json({
        message :" user not found"
      })
    }
  });
});


app.post("/compose", function(req, res) {
  const post = new Post({
    title: req.body.postTitle,
    address: req.body.postAddress,
    type: req.body.postType,
    status: req.body.postStatus,
    price: req.body.postPrice
  });


  post.save(function(err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

app.get("/posts/:postId", function(req, res) {

  const requestedPostId = req.params.postId;

  Post.findOne({
    _id: requestedPostId
  }, function(err, post) {
    res.render("post", {
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
