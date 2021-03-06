var express = require("express"),
  app = express(),
  methoOverride = require("method-override"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  passLocal = require("passport-local").Strategy,
  passportLocalMongoose = require("passport-local-mongoose");
var expressValidator = require("express-validator");
var recipeRoutes = require("./routes/recipeRoute");
var morgan = require("morgan");
var Recipe = require("./models/recipe");
var User = require("./models/user");
var CommentRoutes = require("./models/comment");

mongoose.set("debug", true);
mongoose.connect(
  "mongodb://localhost:27017/recipe_manager",
  { useNewUrlParser: true }
);
// APP CONFIG
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methoOverride("_method"));
app.use(morgan("tiny"));
app.use(expressValidator());

app.use(
  require("express-session")({
    secret: "Passport is the key",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new passLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.currentUser = req.user;
  console.log("USERRRR", req.user)
  next()
})
app.use("/recipes", recipeRoutes);
app.use("/comment", CommentRoutes);

//INDEX Route

app.get("/", function(req, res) {
  res.render("landing");
});

//login routes
app.get("/login", (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
  }),
  (req, res) => {
    console.log("In login's callback function")
  }
);

// profile page
app.get("/profile",isLoggedIn, (req, res) => {
  res.render("profile");
});

// signup routes
app.get("/signup", (req, res) => {
  res.render("signUp");
});

app.post("/signup", (req, res) => {
  console.log(req.body, "SIGNUPPP");

  var username = req.body.username;
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var password = req.body.password;
  var email = req.body.email;
  var phoneNumber = req.body.phoneNumber;
  var newUser = new User({
    username: username,
    firstName: firstName,
    lastName: lastName,
    email: email,
    phoneNumber: phoneNumber
  });
  console.log("USERRRR", newUser);
  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      return res.render("signUp");
    }
    passport.authenticate("local")(req, res, () => {
      res.redirect("/profile");
    });
  });
});

//logout route

app.get('/logout',(req,res)=>{
  req.logout();
  res.redirect('/');
});

// middleware
function isLoggedIn(req,res,next) {
  if(req.isAuthenticated()){
      return next()
  }
  res.redirect('/login')
}

//search route
app.get('/search',(req,res)=>{
 var title= req.query.title;
 console.log("SEARCHHH TITLE", title)
 Recipe.find({'title':title}, (err, recipesList)=>{
   if(err){
     console.log("NO such recipe was found")
   }
   else{
    //  res.send("YAYAAAYYYY")
    console.log("RECIPESSS", recipesList)
    res.render('search', {recipes: recipesList});
   }
 })
  
});

app.listen(3001, function() {
  console.log("Server started!!");
});
