const { httpCodes } = require("@/config/constants");

const notFoundHandler = (req, res) => {
  return res.error(`Không tìm thấy route ${req.originalUrl}`, httpCodes.notFound);
};
module.exports = notFoundHandler;
