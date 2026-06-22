const { httpCodes } = require("@/config/constants");

const healthCheck = (req, res) => {
  return res.success(
    {
      adminId: req.user.id,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status,
    },
    httpCodes.success,
    "Admin API đang hoạt động"
  );
};

module.exports = {
  healthCheck,
};
