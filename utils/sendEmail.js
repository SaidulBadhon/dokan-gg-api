const sgMail = require("@sendgrid/mail");

// Replace with your SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Function to send an email
const sendEmail = async (emailConfig) => {
  const { to, username, otp, link } = emailConfig;

  const msg = {
    to: to,
    from: process.env.FROM_EMAIL,
    templateId: "d-357612253fd940f184d76884907dbc8f",
    dynamic_template_data: {
      subject: `Here is your OTP for Dokan.gg: ${otp}`,
      username,
      otp,
      link,
    },
    subject: `Here is your OTP for Dokan.gg: ${otp}`,
    // text: body,
    // html: body,
  };

  console.log(`msg:`, JSON.stringify(msg, null, 4));
  let responce;

  // Send the email
  await sgMail
    .send(msg)
    .then((e) => {
      // console.log(`msg:`, JSON.stringify(e, null, 4));
      responce = true;
    })
    .catch((error) => {
      // console.log(`error:`, JSON.stringify(error, null, 4));
      responce = false;
    });

  return responce;
};

module.exports = sendEmail;
