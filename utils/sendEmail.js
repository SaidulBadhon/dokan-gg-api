const sgMail = require("@sendgrid/mail");

// Replace with your SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Function to send an email
const sendEmail = async (emailConfig) => {
  const { to, username, otp, link } = emailConfig;

  const msg = {
    to: to,
    from: process.env.FROM_EMAIL,
    templateId: "d-ce573c7d61294069b083ba52b811d63e",
    dynamic_template_data: {
      subject: `Here is your OTP code for Dokan.gg: ${otp}`,
      username,
      otp,
      link,
    },
    subject: `Here is your OTP code for Dokan.gg: ${otp}`,
    // text: body,
    // html: body,
  };

  console.log(`msg:`, JSON.stringify(msg, null, 4));
  let responce;
  // Send the email
  await sgMail
    .send(msg)
    .then(() => {
      responce = true;
    })
    .catch((error) => {
      responce = false;
    });

  return responce;
};

module.exports = sendEmail;
