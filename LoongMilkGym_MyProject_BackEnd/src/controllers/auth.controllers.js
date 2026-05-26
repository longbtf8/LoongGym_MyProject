const { httpCodes } = require("@/config/constants");
const { prisma } = require("@/lib/prisma");
const authService = require("@/services/auth.service");
const { signAccessToken } = require("@/utils/jwt");

const register = async (req, res, next) => {
  try {
    const { email, password, fullname } = req.validated.body;
    const result = await authService.register({ email, password, fullname });
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
  const user = req?.user;
  return res.success(user, httpCodes.success, "Lấy thông tin user thành công");
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
module.exports = { register, login, infoMe, logout, refreshToken };
