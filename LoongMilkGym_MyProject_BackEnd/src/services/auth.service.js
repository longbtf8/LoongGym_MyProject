const bcrypt = require("bcrypt");
const { prisma } = require("@/lib/prisma");
const { signAccessToken, createRefreshToken } = require("@/utils/jwt");
const randomRefreshToken = require("@/utils/randomRefreshToken");
const authConfig = require("@/config/auth.config");
const { httpCodes } = require("@/config/constants");
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
  const token = signAccessToken({ userId: user.id, role: user.role });

  //sendMail

  return {
    user,
    token,
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
  const token = await signAccessToken({
    userId: user.id,
    role: user.role,
  });
  const refreshToken = await createRefreshToken(user);

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
    access_token: token,
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
  const accessToken = await signAccessToken({
    userId: user.id,
    role: user.role,
  });
  const refreshTokenNew = await createRefreshToken(user);
  return { accessToken, refreshTokenNew, userId: refreshTokenDB.userId };
};

module.exports = { register, login, logout, refreshToken };
