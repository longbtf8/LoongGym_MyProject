const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  refreshTokenExpires: parseInt(process.env.AUTH_REFRESH_TOKEN || "7", 10), //day
  verificationJwtSecret: process.env.AUTH_VERIFICATION_JWT_SECRET,
  verificationExpiresIn: process.env.AUTH_VERIFICATION_EXPIRES_IN,
};
module.exports = authConfig;
