//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');


const aboutContent = "Find Parking ..";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/parkingDB", {useNewUrlParser: true});

const parkingSchema = {
  title:String,
  address:String,
  type:String,
  status:String,
  price:String
};

const Post = mongoose.model("Post", parkingSchema);

app.get("/", function(req, res){
  res.render("homepage");
});

app.get("/home", function(req, res){

  Post.find({}, function(err, posts){
    res.render("home", {
      posts: posts
      });
  });
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.get("/signup", function(req, res){
  res.render("signup");
});

app.get("/login", function(req, res){
  res.render("login");
});



app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    address: req.body.postAddress,
    type:req.body.postType,
    status:req.body.postStatus,
    price: req.body.postPrice
  });


  post.save(function(err){
    if (!err){
        res.redirect("/");
    }
  });
});

app.get("/posts/:postId", function(req, res){

const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", {
      title:post.title,
      address: post.address,
      type:post.type,
      status:post.status,
      price: post.price

    });
  });

});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
