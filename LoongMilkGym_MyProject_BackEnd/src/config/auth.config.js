const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  refreshTokenExpires: process.env.AUTH_REFRESH_TOKEN || "7", //day
};
module.exports = authConfig;
