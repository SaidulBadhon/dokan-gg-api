// const crypto = require("crypto");

// function generateOTP() {
//   // Generate a random number between 100000 and 999999
//   const randomNumber = Math.floor(Math.random() * 900000) + 100000;

//   // Use the crypto module to create a hash of the random number
//   const hash = crypto
//     .createHash("sha256")
//     .update(randomNumber.toString())
//     .digest("hex");

//   // Return the first 6 characters of the hash as the OTP code
//   return hash.substring(0, 6).toLocaleUpperCase();
// }

const today = new Date();
const last7Days = [...Array(7)].map((_, i) => {
  const date = new Date(today);
  date.setDate(today.getDate() - i);
  return date;
});

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const last7DaysNamesAndDates = last7Days.map((day) => {
  const dayName = daysOfWeek[day.getDay()];
  const dayDate = day.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  return `${dayName} ${dayDate.replace(/,/g, "")}`;
});
// console.log(last7DaysNamesAndDates);

module.exports = last7DaysNamesAndDates;
