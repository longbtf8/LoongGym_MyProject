const mailConfig = {
  appPassword: process.env.MAIL_APP_PASSWORD,
  fromAddress: process.env.MAIL_FROM_ADDRESS,
  fromName: process.env.MAIL_FROM_NAME,
};
module.exports = mailConfig;
