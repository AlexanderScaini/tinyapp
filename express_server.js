const express = require("express");
const app = express();

// I used port 3080 because 8080 wouldnt work
const PORT = 3080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const { checkEmail, checkPassword, getURLSForUser } = require("./helpers");
const bcrypt = require('bcrypt');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ["1234123123", "123123124"]
}));

const generateRandomString = function() {
  return Math.round((Math.pow(36, 7) - Math.random() * Math.pow(36, 6))).toString(36).slice(1);
};

const urlDatabase = {

};

const users = {

};

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
// redirects users from root to appropriate page
app.get("/", (req, res) => {
  if(users[req.session.user_id]) {
    return res.redirect("urls");
  }
  res.redirect('login');
})

// a log to show if the server is running
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// main page
app.get('/urls', (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = { user: users[user_id], urls: getURLSForUser(urlDatabase, user_id)};
  res.render('urls_index', templateVars);
});

// page where you can submit a url to be shortened
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id], urls: urlDatabase };
  if(users[req.session.user_id]) {
    return res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});

// the page or the shortened url
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] ? urlDatabase[req.params.shortURL].longURL : null};
  res.render("urls_show", templateVars);
});

// when a new url has been submitted by a user it is added to the database and redirects user to the main page where all of their urls are listed
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const randomString = generateRandomString();
    urlDatabase[randomString] = {longURL: req.body.longURL, userID: req.session.user_id};
    return res.redirect(`/urls/${randomString}`);
  }
  // if the user is not logged in they will be redirected to the login page
  res.redirect("/login");
});

// deletes a user's url from their list
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// the page where a user can be redirected to their longURL destination and also edit the longURL
app.post("/urls/:shortURL/edit", (req, res) => {
  console.log("post edit")
  res.redirect(`/urls/${req.params.shortURL}`);
});

// submits the change a user has made to their url
app.post("/urls/:shortURL/update", (req, res) => {
  urlDatabase[req.params.shortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
  const templateVars = { user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] ? urlDatabase[req.params.shortURL].longURL : null};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const targetURL = urlDatabase[shortURL].longURL;
  res.redirect(targetURL);
})


// the login page
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id], urls: urlDatabase };
  res.render("login", templateVars);
});

// submits the credentials the user has put in and will log them into the account if the email and password match
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (checkEmail(users, email)) {
    if (checkPassword(users, email, password)) {
      req.session.user_id = checkPassword(users, email, password);
      return res.redirect("urls");
    } else {
      // if the password wasnt correct the page will be refreshed
      return res.status(403).redirect("login");
    }
  } else {
    // if the email isnt in the database the page will be refreshed
    res.status(403).redirect("login");
  }
});

// logs out the user
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

// the page to register the user
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id], urls: urlDatabase };
  res.render("register", templateVars);
});

// submits the information the user puts in to the registration form
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const newUserId = generateRandomString();
  const newUser = {
    id: newUserId,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  // if any of the fields are empty the page will refresh
  if (!password || !email) {
    res.status(400).redirect("register");
  } else if (checkEmail(users, email)) {
    // if the email already exists in the database the page will refresh
    res.status(400).redirect("register");
  } else {
    // if the email isnt in the database and the password field was filled then a new user will be created and their session will be started
    users[newUserId] = newUser;
    req.session.user_id = newUserId;
    res.redirect("/urls");
  }
});