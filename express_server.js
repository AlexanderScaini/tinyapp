const express = require("express");
const app = express();
const PORT = 3080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { checkEmail, checkPassword } = require("./helper");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

const generateRandomString = function() {
  return Math.round((Math.pow(36, 7) - Math.random() * Math.pow(36, 6))).toString(36).slice(1);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 

}


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls", (req, res) => {
  // console.log(req.body.longURL);  // Log the POST request body to the console
  const randomString = generateRandomString();

  urlDatabase[randomString] = req.body.longURL;

  res.redirect(`/urls/${randomString}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
});

app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`)
});

app.post("/urls/:shortURL/update", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  const templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body
  if (checkEmail(users, email)) {
    if (checkPassword(users, email, password)) {
      res.cookie("user_id", checkPassword(users, email, password));
      res.redirect("urls");
    } else {
      res.status(403)
      res.redirect("login")
    }
  } else {
    res.status(403)
    res.redirect("login")
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body
  const newUserId = generateRandomString();
  const newUser = {
    id: newUserId,
    email, 
    password
  }
  if (!(newUser.password) || !(newUser.email)) {
    res.status(400)
    res.redirect("register")
  } else if (checkEmail(users, email)) {
    res.status(400)
    res.redirect("register")
  } else {
    users[newUserId] = newUser;
    res.cookie('user_id', newUserId);
    res.redirect("/urls")
  }
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render("login", templateVars);
});