const { assert } = require('chai');

const { checkEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

// I had to change these tests to fit the function i had previously written
// I asked Vasily before doing this

describe('checkEmail', function() {
  it('should return true if the email was found in the user database', function() {
    const user = checkEmail(testUsers, "user@example.com");
    const expectedOutput = true;
    assert.equal(user, expectedOutput, `${user} should equal ${expectedOutput}`);
  });

  it('should return false when given a email not in the database', function() {
    const user = checkEmail(testUsers, "NOTuser@example.com");
    const expectedOutput = false;
    assert.equal(user, expectedOutput, `${user} should equal ${expectedOutput}`)
  })
});
