const express = require("express");
const app = express();
const PORT = 3080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const { checkEmail, checkPassword, getURLSForUser } = require("./helpers");
const bcrypt = require('bcrypt');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ["1234123123", "123123124"]
}))

const generateRandomString = function() {
  return Math.round((Math.pow(36, 7) - Math.random() * Math.pow(36, 6))).toString(36).slice(1);
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = { 

}

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const user_id = req.session.user_id
  const templateVars = { user: users[user_id], urls: getURLSForUser(urlDatabase, user_id)};
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id], urls: urlDatabase };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const randomString = generateRandomString();
    urlDatabase[randomString] = {longURL: req.body.longURL, userID: req.session.user_id};
    return res.redirect(`/urls/${randomString}`);
  }
  res.redirect("login")
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
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
  urlDatabase[req.params.shortURL] = { longURL: req.body.longURL, userID: req.session.user_id }
  const templateVars = { user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  res.render("urls_show", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body
  if (checkEmail(users, email)) {
    if (checkPassword(users, email, password)) {
      req.session.user_id = checkPassword(users, email, password);
      return res.redirect("urls");
    } else {
      return res.status(403).redirect("login")
    }
  } else {
    res.status(403).redirect("login")
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id], urls: urlDatabase };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body
  const newUserId = generateRandomString();
  const newUser = {
    id: newUserId,
    email, 
    password: bcrypt.hashSync(password, 10)
  }
  if (!password || !email) {
    res.status(400).redirect("register")
  } else if (checkEmail(users, email)) {
    res.status(400).redirect("register")
  } else {
    users[newUserId] = newUser;
    req.session.user_id = newUserId;
    res.redirect("/urls")
  }
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id], urls: urlDatabase };
  res.render("login", templateVars);
});