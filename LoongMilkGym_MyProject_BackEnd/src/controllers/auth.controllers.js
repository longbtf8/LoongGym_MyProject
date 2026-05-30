const { httpCodes } = require("@/config/constants");
const { prisma } = require("@/lib/prisma");
const authService = require("@/services/auth.service");
const queueService = require("@/services/queue.service");
const { signAccessToken } = require("@/utils/jwt");

const register = async (req, res, next) => {
  try {
    const { email, password, fullname } = req.validated.body;
    const result = await authService.register({ email, password, fullname });
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
    const result = await authService.login({ email, password });
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
    const { accessToken, refreshTokenNew, userId } =
      await authService.refreshToken(refresh_token);

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
module.exports = {
  register,
  login,
  infoMe,
  logout,
  refreshToken,
  verifyEmail,
  changePassword,
};
