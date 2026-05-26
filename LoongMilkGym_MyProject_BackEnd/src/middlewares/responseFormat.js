function responseFormat(req, res, next) {
  res.success = function (data, statusCode = 200, message = "OK") {
    const response = { success: true, message };
    if (data !== null && data !== undefined) {
      response.data = data;
    }
    return res.status(statusCode).json(response);
  };
  res.error = (
    message = "Something went wrong",
    statusCode = 500,
    error = null,
  ) => {
    const response = { success: false, message };

    if (error !== null && error !== undefined) {
      response.error = error;
    }

    return res.status(statusCode).json(response);
  };
  next();
}
module.exports = responseFormat;
