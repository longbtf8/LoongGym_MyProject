const mailConfig = require("@/config/mail.config");
const { transporter } = require("@/lib/nodemailer");
const nodemailer = require("nodemailer");
class MailService {
  async sendVerification(user) {
    const { fromAddress } = mailConfig;
    const info = await transporter.sendMail({
      from: `"${MAIL_FROM_NAME}" <${fromAddress}>`,
      to: `user.email`,
      subject: "Verification",
      text: "Hello world?",
      html: "<b>Hello world?</b>",
    });
  }
}
module.exports = new MailService();
