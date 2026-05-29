const mailService = require("@/services/mail.service");

async function sendVerificationEmail(payload) {
  await mailService.sendVerification(payload);
}
module.exports = sendVerificationEmail;
