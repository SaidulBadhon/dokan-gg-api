const crypto = require("crypto");

function generateOTP() {
  // Generate a random number between 100000 and 999999
  const randomNumber = Math.floor(Math.random() * 900000) + 100000;

  // Use the crypto module to create a hash of the random number
  const hash = crypto
    .createHash("sha256")
    .update(randomNumber.toString())
    .digest("hex");

  // Return the first 6 characters of the hash as the OTP code
  return hash.substring(0, 6).toLocaleUpperCase();
}

module.exports = generateOTP;
