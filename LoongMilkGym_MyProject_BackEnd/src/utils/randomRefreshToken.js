const crypto = require("crypto");
const randomRefreshToken = (size = 32, encoding = "hex") => {
  const key = crypto.randomBytes(size).toString(encoding);
  return key;
};
module.exports = randomRefreshToken;
