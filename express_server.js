var express = require ('express');
var app = express();
var PORT = 8080;

//middleware
app.set("view engine", "ejs");


//data for app
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca" ,
  "9sm5xK": "http://www.google.com"
};

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) =>{
  let templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});



app.listen(PORT, ()=> {
  console.log(`Example app listening on port ${PORT}!`);
});