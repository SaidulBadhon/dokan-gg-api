const bcrypt = require("bcryptjs-then");

async function validatePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = validatePassword;
