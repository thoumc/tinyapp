//middleware
var express = require ('express');
var app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set("view engine", "ejs");
const bcrypt = require('bcryptjs');


//body parser that allow access POST request parameters
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//port of the server
var PORT = 8080;

//function that produces a string of 6 random alphanumeric characters:
function generateRandomString() {

  var randomString = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));

  return randomString;
}

// IM HERE *************************************
//function that filters the user page
function urlsForUser(id) {
  let filterURL = {};
  for (url in urlDatabase){
    if (urlDatabase[url].id === req.cookies["userID"] ){
      filterURL = urlDatabase[url].shortURL
    }
    return filterURL;
    console.log("insidee:" + filterURL);
  }
  console.log("outside" + filterURL);
}

//displays for app
app.get('/', (req, res) =>{
  res.end("Welcome to the tiny app!")
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//data for app
var urlDatabase = {
  "b2xVn2": {
    shortURL: "b2xVn2",
    longURL:"http://www.lighthouselabs.ca",
    userID: "userRandomID" },
  "9sm5xK": {
    shortURL: "9sm5xK",
    longURL: "http://www.google.com",
    userID: "user2RandomID" }
  }

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
    password: "df"
  }}

//login with cookie

app.post("/login", (req, res)=>{

  const password = req.body["userPassword"]
  const hashedPassword = bcrypt.hashSync(password, 10);

  for (var userID in users){
    if (users[userID].email === req.body["userEmail"]) {
      if (bcrypt.compareSync(password, hashedPassword)) {
        res.cookie("userID", userID);
        res.redirect("/urls");
        console.log(users[userID].email)
        console.log(req.body['userEmail'])
      } else {
        res.status(403).render("400");
        console.log(users[userID].email)
      console.log(req.body['userEmail'])
      }
      return;
    }
  }
  res.status(403).render("400")

})

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

  function urlsForUser (){
    var filterURL = {}
    for (shortURL in urlDatabase) {
      if (urlDatabase[shortURL].userID === req.cookies.userID){
        filterURL[shortURL] = urlDatabase[shortURL]
      }
    }
    return filterURL;
  }


  let templateVars = {urls: urlsForUser(urlDatabase), user: users[req.cookies["userID"]]};
  res.render("urls_index", templateVars);
});

//show page for new url addtion
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

  urlDatabase[randomURL]= newURL
  console.log(newURL)

  res.redirect( "/urls/" + randomURL)


  });

//delete urls in database
app.post("/urls/:shortURL/delete", (req, res) =>{
if (req.cookies["userID"] === urlDatabase[req.params["shortURL"]].userID){
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls");
} else {
  res.status(400).render("400");
}
})

//redirect to long url ***&&&&****&&&***
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
  console.log(req.body)
});


//edit
app.post("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: users[req.cookies["userID"]],
    url: urlDatabase[req.params["shortURL"]] }
if (req.cookies["userID"] === urlDatabase[req.params["shortURL"]].userID){
  res.redirect("/urls/" + req.params.shortURL)
} else {
  res.status(400).render("400");
}
})

app.post("/urls/:shortURL/edit", (req, res) => {
    urlDatabase[req.params["shortURL"]]["longURL"] = req.body["longURL"];
    res.redirect("/urls")
});

// show
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: users[req.cookies["userID"]],
    url: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
});

//register page
app.get("/register", (req, res) => {
  let templateVars = {userID: req.cookies["userID"],}
  res.render("urls_register", templateVars)
})

// action to get registered

app.post("/register", (req, res) => {

  let alreadyExists = false;

  for (var userID in users) {
    if (users[userID].email === req.body.email) {
      alreadyExists = true;
    }};

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
  }
});


app.listen(PORT, ()=> {
  console.log(`Example app listening on port ${PORT}!`);
});