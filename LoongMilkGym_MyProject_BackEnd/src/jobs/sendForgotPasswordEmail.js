const mailService = require("@/services/mail.service");

async function sendForgotPasswordEmail(payload) {
  await mailService.sendForgotPassword(payload);
}
module.exports = sendForgotPasswordEmail;
