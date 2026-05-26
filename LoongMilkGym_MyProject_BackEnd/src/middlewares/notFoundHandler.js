const notFoundHandler = (req, res) => {
  return res.error(`Route ${req.originalUrl} not found`, 404);
};
module.exports = notFoundHandler;
