const { httpCodes } = require("@/config/constants");
const { prisma } = require("@/lib/prisma");
const authService = require("@/services/auth.service");
const queueService = require("@/services/queue.service");
const { signAccessToken } = require("@/utils/jwt");
const { UAParser } = require("ua-parser-js");

const getRequestMetadata = (req) => {
  const userAgentStr = req.headers["user-agent"] || "";
  const sessionId = req.headers["x-session-id"] || null;
  // Lấy IP chính xác từ headers (xử lý danh sách IP đi qua proxy) hoặc express client IP
  let ipAddress = req.headers["x-forwarded-for"] || req.ip || "";
  if (ipAddress.includes(",")) {
    ipAddress = ipAddress.split(",")[0].trim();
  }
  
  const parser = new UAParser(userAgentStr);
  const ua = parser.getResult();
  
  let deviceName = "Thiết bị không xác định";
  if (ua.os.name) {
    deviceName = `${ua.os.name}`;
    if (ua.browser.name) {
      deviceName += ` (${ua.browser.name})`;
    }
  } else if (ua.browser.name) {
    deviceName = ua.browser.name;
  }

  return {
    sessionId,
    deviceName,
    ipAddress,
  };
};

const register = async (req, res, next) => {
  try {
    const { email, password, fullname } = req.validated.body;
    const metadata = getRequestMetadata(req);
    const result = await authService.register({ email, password, fullname }, metadata);
    const infoVerification = {
      id: result.user.id,
      email: result.user.email,
    };

    await queueService.push("sendVerificationEmail", infoVerification);
    return res.success(result, httpCodes.created, "Đăng ký thành công");
  } catch (error) {
    next(error);
  }
};
const login = async (req, res, next) => {
  try {
    const { email, password } = req.validated.body;
    const metadata = getRequestMetadata(req);
    const result = await authService.login({ email, password }, metadata);
    return res.success(result, httpCodes.created, "Đăng nhập thành công");
  } catch (error) {
    next(error);
  }
};
const infoMe = async (req, res, next) => {
  try {
    const user = req?.user;
    return res.success(
      user,
      httpCodes.success,
      "Lấy thông tin user thành công",
    );
  } catch (error) {
    next(error);
  }
};
const logout = async (req, res, next) => {
  try {
    const { accessToken, tokenPayload } = req;
    await authService.logout({ accessToken, tokenPayload });
    return res.success(null, httpCodes.success, "Đăng xuất thành công");
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    const metadata = getRequestMetadata(req);
    const { accessToken, refreshTokenNew, userId } =
      await authService.refreshToken(refresh_token, metadata);

    return res.success({
      userId: userId,
      access_token: accessToken,
      refresh_token: refreshTokenNew,
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const result = await authService.verifyEmail(token);
    return res.success(
      result,
      httpCodes.success,
      "Xác thực thành công , Vui lòng đăng nhập",
    );
  } catch (error) {
    return res.error(
      "Liên kết hết hiệu lực hoặc có lỗi xảy ra . Vui lòng thử lại",
      httpCodes.unauthorized,
    );
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.validated.body;
    const userId = req.user.id;
    await authService.changePassword({ userId, oldPassword, newPassword });
    return res.success(null, httpCodes.success, "Đổi mật khẩu thành công");
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.validated.body;
    const { email: userEmail, token } = await authService.forgotPassword({ email });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await queueService.push("sendForgotPasswordEmail", { email: userEmail, resetLink });
    return res.success(
      null,
      httpCodes.success,
      "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn",
    );
  } catch (error) {
    next(error);
  }
};
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.validated.body;

    await authService.resetPassword({
      token,
      newPassword: password,
    });

    return res.success(null, httpCodes.success, "Đặt lại mật khẩu thành công");
  } catch (error) {
    next(error);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.validated.body;
    const user = await authService.resendVerification({ email });
    const infoVerification = {
      id: user.id,
      email: user.email,
    };
    await queueService.push("sendVerificationEmail", infoVerification);
    return res.success(
      null,
      httpCodes.success,
      "Gửi lại email xác thực thành công. Vui lòng kiểm tra hộp thư.",
    );
  } catch (error) {
    next(error);
  }
};

const getDevices = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const currentRefreshToken = req.headers["x-refresh-token"] || null;
    const devices = await authService.getDevices(userId, currentRefreshToken);
    return res.success(devices, httpCodes.success, "Lấy danh sách thiết bị thành công");
  } catch (error) {
    next(error);
  }
};

const revokeDevice = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: tokenId } = req.params;
    await authService.revokeDevice({ userId, tokenId });
    return res.success(null, httpCodes.success, "Đăng xuất thiết bị thành công");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  infoMe,
  logout,
  refreshToken,
  verifyEmail,
  changePassword,
  resetPassword,
  forgotPassword,
  resendVerification,
  getDevices,
  revokeDevice,
};
