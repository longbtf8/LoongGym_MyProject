const { httpCodes } = require("@/config/constants");

const notFoundHandler = (req, res) => {
  return res.error(`Route ${req.originalUrl} not found`, httpCodes.notFound);
};
module.exports = notFoundHandler;
