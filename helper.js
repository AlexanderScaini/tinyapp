const checkEmail = (db, email) => {
  for (const user in db) {
    const currentUser = db[user]
    if (currentUser.email === email) {
      return true
    }
  }
  return null
}

const checkPassword = (db, email, password) => {
  for (const user in db) {
    const currentUser = db[user]
    if (currentUser.email === email) {
      if (currentUser.password === password) {
        return db[user].id
      }
    }
  }
  return null
}

const getURLSForUser = (urls, user_id) => {
  let result = {};
  for (const url in urls) {
    if (urls[url].userID === user_id) {
      result[url] = urls[url]
    }
  }
  return result;
}

module.exports = { checkEmail, checkPassword, getURLSForUser }