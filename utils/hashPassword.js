const bcrypt = require("bcryptjs-then");

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

module.exports = hashPassword;
