//middleware
var express = require ('express');
var app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set("view engine", "ejs");
//body parser that allow access POST request parameters
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var PORT = 8080;

//function that produces a string of 6 random alphanumeric characters:
function generateRandomString() {

  var randomString = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));

  return randomString;
}

//function to match url and url.id ********
const findURL = id => {
  const URL = urlDatabase.filter(URL => url.id === id)[0];

  return URL;
};

//data for app
var urlDatabase = [
  {
    shortURL: "b2xVn2",
    longURL:"http://www.lighthouselabs.ca",
    userID: "userRandomID" },
  {
    shortURL: "9sm5xK",
    longURL: "http://www.google.com",
    userID: "user2RandomID" }
];

// users of the app
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "123" :{
    id: "123",
    email: "12@12.com",
    password: "12"
  }
}


//displays for app
app.get('/', (req, res) =>{
  res.end("Welcome to the tiny app!")
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//login with cookie
app.post("/login", (req, res)=>{
  //res.cookie("userEmail", req.body["userEmail"]);

  let alreadyExists = false;

  for (var userID in users) {
    if (users[userID].email === req.body["userEmail"]) {
      alreadyExists = true;
    } if (alreadyExists && users[userID].password === req.body["userPassword"]){
        console.log("userID is ", userID);
        res.cookie("userID", users[userID]);
        res.redirect("/urls");
        break;

      } else {
        res.status(403);
        res.render("400");
        console.log(users[userID].email);
  } }
  console.log(req.body.userEmail)
});

//login page
app.get("/login", (req, res) =>{
  let templateVars = {user: users[req.cookies["userID"]]};
  res.render("urls_login", templateVars)
})

//logout
app.post("/logout", (req, res) =>{
  res.clearCookie("userID", {user: users[req.cookies["userID"]]})
  res.redirect("/urls")
})


//show the list of urls on database
app.get('/urls', (req, res) =>{
  let templateVars = {urls: urlDatabase, user: users[req.cookies["userID"]]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {user: users[req.cookies["userID"]]};
     if (req.cookies["userID"]){
      res.render("urls_new", templateVars);
  } else {
  res.render("urls_login");
}});


//assign randomized characters to new long url
app.post("/urls", (req, res) => {
  let randomURL = generateRandomString()
  let newURL = {
    shortURL: randomURL,
    longURL: req.body.longURL,
    userID: req.cookies["userID"].id
  }
  urlDatabase.push(newURL);
  res.redirect( "/urls/" + randomURL)

  });

//delete urls in database
app.post("/urls/:shortURL/delete", (req, res) =>{
  delete urlDatabase[req.params.shortURL]
  res.redirect("http://localhost:8080/urls");
})

//redirect to long url
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
  console.log(req.body)
});

//edit
app.post("/urls/:shortURL", (req, res) => {
  //console.log(req.body);
  urlDatabase[req.params["shortURL"]] = req.body["longURL"]

  res.redirect("/urls")
})

//show
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: users[req.cookies["userID"]],
    shortURL : shortURL };
  const shortURL = findURL(req.params.id);
  if (shortURL){
    res.render("urls_show", templateVars);
  } else {
    res.render("404")
  }

});

//registration page (***** do i need the cookies template here?)
app.get("/register", (req, res) => {
  let templateVars = {userID: req.cookies["userID"],}
  res.render("urls_register", templateVars)
})

// get registered
app.post("/register", (req, res) => {

  let alreadyExists = false;

  for (var userID in users) {
    if (users[userID].email === req.body.email) {
      alreadyExists = true;
    }

  if (alreadyExists || !req.body.email || !req.body.password) {
    res.status(400);
    res.render("400");
    console.log(users[userID].email);
  } else {
    let randomUserID = generateRandomString();
    let newUser = {
      id: randomUserID,
      email: req.body["email"],
      password: req.body["password"]
    }
    users[randomUserID] = newUser;
    res.cookie("userID", randomUserID )
    res.redirect("/urls");
    console.log(users);
    console.log(users[userID].email);
  } }
});



app.listen(PORT, ()=> {
  console.log(`Example app listening on port ${PORT}!`);
});