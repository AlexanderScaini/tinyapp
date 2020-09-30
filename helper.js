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

module.exports = { checkEmail, checkPassword }