const { httpCodes } = require("@/config/constants");

const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body||{},
      params: req.params,
      query: req.query,
    });
    if (!result.success) {
      const formattedErrors = {};
      result.error.issues.forEach(error => {
      const fieldName = error.path.slice(1).join(".") || error.path[0];
      if(!formattedErrors[fieldName]){
        formattedErrors[fieldName] = [];
      }
      formattedErrors[fieldName].push(error.message);
      });
      return res.status(httpCodes.badRequest).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: formattedErrors,
      });
    }
    req.validated = result.data;
    next();
  };
};
module.exports = validate;
