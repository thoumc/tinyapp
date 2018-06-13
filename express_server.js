var express = require ('express');
var app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());
//body parser that allow access POST request parameters
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var PORT = 8080;



//middleware
app.set("view engine", "ejs");

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


//displays for app
app.get('/', (req, res) =>{
  res.end("Hello!")
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
  console.log(req.body);

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



app.listen(PORT, ()=> {
  console.log(`Example app listening on port ${PORT}!`);
});