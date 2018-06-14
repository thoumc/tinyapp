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


//data for app
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca" ,
  "9sm5xK": "http://www.google.com"
};

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
  res.cookie("username", req.body.username)
  res.redirect("/urls")
})

//logout
app.post("/logout", (req, res) =>{
  res.clearCookie("username", req.body["username"])
  res.redirect("/urls")
})

//show the list of urls on database
app.get('/urls', (req, res) =>{
  let templateVars = {urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

// assign randomized characters to new long url
app.post("/urls", (req, res) => {
  //console.log(req.body);

  var errors = [];
  let randomURL = generateRandomString()
  urlDatabase[randomURL] = req.body.longURL
  res.redirect( "http://localhost:8080/urls/" + randomURL)

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
  let templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

//registration page (***** do i need the cookies template here?)
app.get("/register", (req, res) => {
  let templateVars = {username: req.cookies["username"],}
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