const sgMail = require("@sendgrid/mail");

// Replace with your SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// templateId: "d-357612253fd940f184d76884907dbc8f", // generateOTP
// templateId: 'd-2acb2a43c5344a5a811d4c97b178ccca', // forgotPasswordOTP

// Function to send an email
const sendEmail = async (emailConfig) => {
  const { to, subject, username, otp, link, templateId } = emailConfig;

  const msg = {
    to: to,
    from: process.env.FROM_EMAIL,
    templateId,
    dynamic_template_data: {
      subject,
      username,
      otp,
      link,
    },
    subject,
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
