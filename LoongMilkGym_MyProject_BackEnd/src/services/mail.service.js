const authConfig = require("@/config/auth.config");
const mailConfig = require("@/config/mail.config");
const { transporter } = require("@/lib/nodemailer");
const jwt = require("jsonwebtoken");
const authService = require("./auth.service");
const ejs = require("ejs");
const path = require("path");
class MailService {
  getTemplatePath(template) {
    const templatePath = path.join(
      __dirname,
      "..",
      "resources",
      "mail",
      `${template.replace(/\.ejs$/, "")}.ejs`,
    );
    return templatePath;
  }
  async send(option) {
    const { template, templateData, ...restOption } = option;
    const templatePath = this.getTemplatePath(template);
    const html = await ejs.renderFile(templatePath, templateData);
    const info = await transporter.sendMail({ ...restOption, html });
    return info;
  }

  async sendVerification(user) {
    const { fromAddress, fromName } = mailConfig;

    const verificationLink = authService.generateVerificationLink(user);

    await this.send({
      from: `"${fromName}" <${fromAddress}>`,
      to: user.email,
      subject: "Xác thực email của bạn - LoongMilkGym",
      text: "Vui lòng xác thực email của bạn.",
      template: "auth/verificationEmail",
      templateData: {
        verificationLink,
      },
    });
  }

  async sendForgotPassword({ email, resetLink }) {
    const { fromAddress, fromName } = mailConfig;

    await this.send({
      from: `"${fromName}" <${fromAddress}>`,
      to: email,
      subject: "Đặt lại mật khẩu của bạn - LoongMilkGym",
      text: "Vui lòng sử dụng liên kết dưới đây để đặt lại mật khẩu.",
      template: "auth/forgotPasswordEmail",
      templateData: {
        reset_link: resetLink,
      },
    });
  }
}
module.exports = new MailService();
