const randomNumber = () => {
  // Get current date and time
  const now = new Date();

  // Extract relevant components from date and time
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // Note: Months are 0-indexed in JavaScript
  const day = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // Combine components into a single string
  const dateTimeString = `${year}${month}${day}${hours}${minutes}${seconds}`;

  // Generate a random 8-digit number using the date and time string
  return parseInt(dateTimeString) + Math.floor(Math.random() * 100000000);
};

module.exports = randomNumber;
