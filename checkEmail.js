const checkEmail = (db, email) => {
  for (const user in db) {
    const currentUser = db[user]
    if (currentUser.email === email) {
      return true
    }
  }
  return null
}

module.exports = checkEmail;