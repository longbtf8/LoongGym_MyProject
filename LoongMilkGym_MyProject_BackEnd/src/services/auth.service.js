const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { prisma } = require("@/lib/prisma");
const { generateAuthTokens } = require("@/utils/jwt");
const randomRefreshToken = require("@/utils/randomRefreshToken");
const { httpCodes } = require("@/config/constants");
const jwt = require("jsonwebtoken");
const authConfig = require("@/config/auth.config");

const register = async ({ email, password, fullname }) => {
  const existedUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existedUser) {
    const error = new Error("The email already exists.");
    error.statusCode = httpCodes.conflict;
    throw error;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      profile: {
        create: {
          fullName: fullname || null,
        },
      },
      settings: {
        create: {
          language: "vi",
          unitSystem: "metric",
          theme: "dark",
        },
      },
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      profile: true,
      settings: true,
    },
  });
  const { accessToken, refreshToken } = await generateAuthTokens(user);

  //sendMail

  return {
    user,
    access_token: accessToken,
    refresh_token: refreshToken,
  };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      profile: true,
      settings: true,
    },
  });
  console.log(user);
  if (!user) {
    const error = new Error("Email hoặc mật khẩu không đúng");
    error.statusCode = httpCodes.unauthorized;
    throw error;
  }

  if (user.status !== "ACTIVE") {
    const error = new Error("Tài khoản đã bị khóa hoặc không hoạt động");
    error.statusCode = httpCodes.forbidden;
    throw error;
  }
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    const error = new Error("Email hoặc mật khẩu không đúng");
    error.statusCode = httpCodes.unauthorized;
    throw error;
  }
  if (!user.emailVerifiedAt) {
    const error = new Error("Vui lòng xác thực email");
    error.statusCode = httpCodes.unauthorized;
    throw error;
  }
  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
    },
  });
  const { accessToken, refreshToken } = await generateAuthTokens(user);

  const safeUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    emailVerifiedAt: user.emailVerifiedAt,
    lastLoginAt: new Date(),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    profile: user.profile,
    settings: user.settings,
  };

  return {
    user: safeUser,
    access_token: accessToken,
    refresh_token: refreshToken,
  };
};

const logout = async ({ accessToken, tokenPayload }) => {
  await prisma.revokedTokens.create({
    data: {
      userId: tokenPayload.userId,
      tokenHash: accessToken,
      expiresAt: new Date(tokenPayload.exp * 1000),
      reason: "logout",
    },
  });
};

const refreshToken = async (refresh_token) => {
  const refreshTokenDB = await prisma.refreshTokens.findFirst({
    where: {
      token: refresh_token,
      expiresAt: {
        gt: new Date(),
      },
    },
    select: {
      id: true,
      userId: true,
      token: true,
      user: { select: { role: true } },
    },
  });
  if (!refreshTokenDB) {
    const error = new Error("Unauthorized");
    error.statusCode = httpCodes.unauthorized;
    throw error;
  }
  await prisma.refreshTokens.delete({
    where: {
      id: refreshTokenDB.id,
    },
  });
  const user = {
    id: refreshTokenDB.userId,
    role: refreshTokenDB.user.role,
  };
  const { accessToken, refreshToken: refreshTokenNew } =
    await generateAuthTokens(user);
  return { accessToken, refreshTokenNew, userId: refreshTokenDB.userId };
};
const generateVerificationLink = (user) => {
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    authConfig.verificationJwtSecret,
    { expiresIn: authConfig.verificationExpiresIn },
  );
  const verificationLink = `http://localhost:5173?token=${token}`;
  return verificationLink;
};
const verifyEmail = async (token) => {
  const payload = jwt.verify(token, authConfig.verificationJwtSecret);
  
  // Cập nhật trạng thái xác thực email vào Database
  await prisma.user.update({
    where: { id: payload.userId },
    data: {
      emailVerifiedAt: new Date(),
    },
  });
  
  return payload;
};
const changePassword = async ({ userId, oldPassword, newPassword }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    const error = new Error("Người dùng không tồn tại");
    error.statusCode = httpCodes.notFound;
    throw error;
  }
  const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isPasswordValid) {
    const error = new Error("Mật khẩu cũ không chính xác");
    error.statusCode = httpCodes.badRequest;
    throw error;
  }
  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: newPasswordHash,
    },
  });
};

const forgotPassword = async ({ email }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    const error = new Error("Email không tồn tại trong hệ thống");
    error.statusCode = httpCodes.notFound;
    throw error;
  }
  
  // Generate random token using utility helper
  const token = randomRefreshToken();
  // Hash token to save in DB
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  
  // Calculate expiration time (15 mins)
  const expiresAt = new Date(Date.now() + authConfig.passwordResetExpiresIn * 60 * 1000);
  
  // Clean up any old reset tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  });
  
  // Save new reset token
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });
  
  return {
    email: user.email,
    token,
  };
};

const resetPassword = async ({ token, newPassword }) => {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  
  const resetTokenRecord = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      expiresAt: {
        gt: new Date(),
      },
    },
  });
  
  if (!resetTokenRecord) {
    const error = new Error("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn");
    error.statusCode = httpCodes.badRequest;
    throw error;
  }
  
  // Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  
  // Update user password
  await prisma.user.update({
    where: { id: resetTokenRecord.userId },
    data: {
      passwordHash: newPasswordHash,
    },
  });
  
  // Delete all used tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { userId: resetTokenRecord.userId },
  });
};

const resendVerification = async ({ email }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    const error = new Error("Người dùng không tồn tại");
    error.statusCode = httpCodes.notFound;
    throw error;
  }
  if (user.emailVerifiedAt) {
    const error = new Error("Email này đã được xác thực trước đó");
    error.statusCode = httpCodes.badRequest;
    throw error;
  }
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  generateVerificationLink,
  verifyEmail,
  changePassword,
  forgotPassword,
  resetPassword,
  resendVerification,
};
