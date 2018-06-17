//middleware
var express = require ('express');
var app = express();
var cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
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

//function that filters the user page
function urlsForUser (){
    var filterURL = {}
    for (shortURL in urlDatabase) {
      if (urlDatabase[shortURL].userID === req.session.userID){
        filterURL[shortURL] = urlDatabase[shortURL]
      }
    }
    return filterURL;
  }

//HomePage
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
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


//login with cookie.session

app.post("/login", (req, res)=>{

  for (var userID in users){
    if (users[userID].email === req.body["userEmail"]) {
      if (bcrypt.compareSync(users[userID].password, bcrypt.hashSync(req.body["userPassword"], 10) )) {
        req.session["userID"] = users[userID].id
        res.redirect("/urls");
      } else {
        res.status(403).render("403");
      }
      return;
    }
  }
  return res.status(403).render("403")
});


//login page
app.get("/login", (req, res) =>{
  let templateVars = {user: users[req.session["userID"]]};
  res.render("urls_login", templateVars)
})

//logout
app.post("/logout", (req, res) =>{
  req.session = null
  res.redirect("/urls")
})

//show the list of urls on database
app.get('/urls', (req, res) =>{

  function urlsForUser (){
    var filterURL = {}
    for (shortURL in urlDatabase) {
      if (urlDatabase[shortURL].userID === req.session.userID){
        filterURL[shortURL] = urlDatabase[shortURL]
      }
    }
    return filterURL;
  }
  let templateVars = {urls: urlsForUser(urlDatabase), user: users[req.session["userID"]]};
  res.render("urls_index", templateVars);
});

//show page for new url addtion
app.get("/urls/new", (req, res) => {
  let templateVars = {user: users[req.session["userID"]]};
     if (req.session["userID"]){
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
    userID: req.session["userID"]
  }

  urlDatabase[randomURL]= newURL
  res.redirect( "/urls/" + randomURL)
  });

//delete urls in database
app.post("/urls/:shortURL/delete", (req, res) =>{
if (req.session["userID"] === urlDatabase[req.params["shortURL"]].userID){
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls");
} else {
  res.status(403).render("403");
}
})

//redirect to long url
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


//edit
app.post("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: users[req.session["userID"]],
    url: urlDatabase[req.params["shortURL"]] }
if (req.session["userID"] === urlDatabase[req.params["shortURL"]].userID){
  res.redirect("/urls/" + req.params.shortURL)
} else {
  res.status(400).render("400");
}
});

app.post("/urls/:shortURL/edit", (req, res) => {
    urlDatabase[req.params["shortURL"]]["longURL"] = req.body["longURL"];
    res.redirect("/urls")
});

// show
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: users[req.session["userID"]],
    url: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
});

//register page
app.get("/register", (req, res) => {
  let templateVars = {userID: req.session["userID"],}
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
    req.session.userID = randomUserID
    res.redirect("/urls");
    console.log(users);
    console.log(users[userID].email);
  }
});


app.listen(PORT, ()=> {
  console.log(`Example app listening on port ${PORT}!`);
});