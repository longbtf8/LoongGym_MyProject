const crypto = require("crypto");
const generateKey = () => {
  const key = crypto.randomBytes(32).toString("hex");
  console.log(key);
  return key;
};
generateKey();
