const { prisma } = require("@/lib/prisma");
const { httpCodes } = require("@/config/constants");
const { convertToKg, convertToCm, convertFromStandard } = require("@/utils/unitConverter");
const { deleteOldImage } = require("@/utils/cloudinary");
const AppError = require("@/utils/AppError");

/**
 * Service lấy thông tin chi tiết Profile của user
 */
const getProfile = async (userId) => {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          email: true,
          role: true,
          status: true,
          _count: {
            select: {
              followers: true,
              following: true,
              workoutSessions: {
                where: { status: "completed" }
              }
            }
          }
        }
      }
    }
  });

  if (!profile) {
    throw new AppError("Không tìm thấy thông tin hồ sơ người dùng.", httpCodes.notFound);
  }

  // Chuyển đổi và bổ sung các chỉ số đo lường hiển thị tùy chỉnh (Pound, Stone, Inch, Feet)
  const displayHeight = convertFromStandard(profile.heightCm, profile.heightUnit, "height");
  const displayWeight = convertFromStandard(profile.weightKg, profile.weightUnit, "weight");

  const followersCount = profile.user._count.followers;
  const followingCount = profile.user._count.following;
  const workoutsCount = profile.user._count.workoutSessions;

  const progressPhotos = await prisma.progressPhoto.findMany({
    where: { userId },
    orderBy: { takenAt: "desc" }
  });

  const completedWorkouts = await prisma.workoutSession.findMany({
    where: { userId, status: "completed" },
    orderBy: { createdAt: "desc" },
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: true
        }
      }
    },
    take: 10
  });

  return {
    ...profile,
    displayHeight,
    displayWeight,
    followersCount,
    followingCount,
    workoutsCount,
    progressPhotos,
    completedWorkouts
  };
};

/**
 * Service cập nhật thông tin cá nhân và quy đổi đơn vị đo lường linh hoạt
 */
const updateProfile = async (userId, data) => {
  const {
    fullName,
    phone,
    address,
    gender,
    birthDate,
    height,
    weight,
    heightUnit,
    weightUnit,
    heightCm: directHeightCm,
    weightKg: directWeightKg,
    membershipTier,
    fitnessLevel,
    goal,
    bio,
    calorieGoal
  } = data;

  // Xác định đơn vị hiển thị mới (nếu có cập nhật, không thì giữ nguyên của DB hiện tại)
  const currentProfile = await prisma.userProfile.findUnique({
    where: { userId }
  });

  if (!currentProfile) {
    throw new AppError("Không tìm thấy thông tin hồ sơ người dùng.", httpCodes.notFound);
  }

  const finalHeightUnit = heightUnit || currentProfile.heightUnit || "cm";
  const finalWeightUnit = weightUnit || currentProfile.weightUnit || "kg";

  // Quy đổi chiều cao về CM
  let resolvedHeightCm = currentProfile.heightCm;
  if (directHeightCm !== undefined) {
    resolvedHeightCm = directHeightCm;
  } else if (height !== undefined) {
    resolvedHeightCm = convertToCm(height, finalHeightUnit);
  }

  // Quy đổi cân nặng về KG
  let resolvedWeightKg = currentProfile.weightKg;
  if (directWeightKg !== undefined) {
    resolvedWeightKg = directWeightKg;
  } else if (weight !== undefined) {
    resolvedWeightKg = convertToKg(weight, finalWeightUnit);
  }

  // Xử lý chuyển đổi ngày sinh thành đối tượng Date hợp lệ
  let parsedBirthDate = currentProfile.birthDate;
  if (birthDate) {
    parsedBirthDate = new Date(birthDate);
  }

  const updatedProfile = await prisma.userProfile.update({
    where: { userId },
    data: {
      fullName,
      phone,
      address,
      gender,
      birthDate: parsedBirthDate,
      heightCm: resolvedHeightCm,
      weightKg: resolvedWeightKg,
      heightUnit: finalHeightUnit,
      weightUnit: finalWeightUnit,
      membershipTier,
      fitnessLevel,
      goal,
      bio,
      calorieGoal: calorieGoal !== undefined ? (calorieGoal === "" || calorieGoal === null ? null : Number(calorieGoal)) : undefined
    }
  });

  const displayHeight = convertFromStandard(updatedProfile.heightCm, updatedProfile.heightUnit, "height");
  const displayWeight = convertFromStandard(updatedProfile.weightKg, updatedProfile.weightUnit, "weight");

  return {
    ...updatedProfile,
    displayHeight,
    displayWeight,
  };
};

const normalizePhotoProfile = (value, fallback = {}) => {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

const isCloudinaryUrl = (url = "") => url.includes("res.cloudinary.com") || url.includes("cloudinary");

const uploadAvatar = async (userId, file, avatarProfile = {}) => {
  if (!file) {
    throw new AppError("Vui lòng tải lên một file hình ảnh.", httpCodes.badRequest);
  }

  const avatarUrl = file.path || file.secure_url;

  if (!avatarUrl) {
    throw new AppError("Tải ảnh lên Cloudinary thất bại.", httpCodes.badRequest);
  }

  // 1. Lấy thông tin UserProfile hiện tại để tìm ảnh đại diện cũ
  const currentProfile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { avatarUrl: true },
  });

  // 2. Nếu có ảnh đại diện cũ và là ảnh trên Cloudinary, tiến hành xóa
  if (currentProfile && currentProfile.avatarUrl && isCloudinaryUrl(currentProfile.avatarUrl)) {
    await deleteOldImage(currentProfile.avatarUrl);
  }

  // 3. Cập nhật URL ảnh đại diện mới vào cơ sở dữ liệu
  const updatedProfile = await prisma.userProfile.update({
    where: { userId },
    data: { avatarUrl, avatarProfile: normalizePhotoProfile(avatarProfile) },
  });

  return {
    avatarUrl: updatedProfile.avatarUrl,
    avatarProfile: updatedProfile.avatarProfile,
    updatedAt: updatedProfile.updatedAt,
  };
};

const uploadCover = async (userId, file, coverPhotoProfile = {}) => {
  if (!file) {
    throw new AppError("Vui lòng tải lên một file hình ảnh.", httpCodes.badRequest);
  }

  const coverPhotoUrl = file.path || file.secure_url;

  if (!coverPhotoUrl) {
    throw new AppError("Tải ảnh lên Cloudinary thất bại.", httpCodes.badRequest);
  }

  // 1. Lấy thông tin UserProfile hiện tại để tìm ảnh nền cũ
  const currentProfile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { coverPhotoUrl: true },
  });

  // 2. Nếu có ảnh nền cũ, tiến hành xóa
  if (currentProfile && currentProfile.coverPhotoUrl && isCloudinaryUrl(currentProfile.coverPhotoUrl)) {
    await deleteOldImage(currentProfile.coverPhotoUrl);
  }

  // 3. Cập nhật URL ảnh nền mới vào cơ sở dữ liệu
  const updatedProfile = await prisma.userProfile.update({
    where: { userId },
    data: { coverPhotoUrl, coverPhotoProfile: normalizePhotoProfile(coverPhotoProfile) },
  });

  return {
    coverPhotoUrl: updatedProfile.coverPhotoUrl,
    coverPhotoProfile: updatedProfile.coverPhotoProfile,
    updatedAt: updatedProfile.updatedAt,
  };
};

const updateAvatarPhoto = async (userId, { avatarUrl, avatarProfile }) => {
  if (!avatarUrl) {
    throw new AppError("Vui lòng chọn ảnh đại diện.", httpCodes.badRequest);
  }

  const currentProfile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { avatarUrl: true },
  });

  if (currentProfile?.avatarUrl && currentProfile.avatarUrl !== avatarUrl && isCloudinaryUrl(currentProfile.avatarUrl)) {
    await deleteOldImage(currentProfile.avatarUrl);
  }

  const updatedProfile = await prisma.userProfile.update({
    where: { userId },
    data: {
      avatarUrl,
      avatarProfile: normalizePhotoProfile(avatarProfile),
    },
  });

  return {
    avatarUrl: updatedProfile.avatarUrl,
    avatarProfile: updatedProfile.avatarProfile,
    updatedAt: updatedProfile.updatedAt,
  };
};

const updateCoverPhoto = async (userId, { coverPhotoUrl, coverPhotoProfile }) => {
  const currentProfile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { coverPhotoUrl: true },
  });

  if (!coverPhotoUrl) {
    if (currentProfile?.coverPhotoUrl && isCloudinaryUrl(currentProfile.coverPhotoUrl)) {
      await deleteOldImage(currentProfile.coverPhotoUrl);
    }

    const updatedProfile = await prisma.userProfile.update({
      where: { userId },
      data: {
        coverPhotoUrl: null,
        coverPhotoProfile: null,
      },
    });

    return {
      coverPhotoUrl: updatedProfile.coverPhotoUrl,
      coverPhotoProfile: updatedProfile.coverPhotoProfile,
      updatedAt: updatedProfile.updatedAt,
    };
  }

  if (currentProfile?.coverPhotoUrl && currentProfile.coverPhotoUrl !== coverPhotoUrl && isCloudinaryUrl(currentProfile.coverPhotoUrl)) {
    await deleteOldImage(currentProfile.coverPhotoUrl);
  }

  const updatedProfile = await prisma.userProfile.update({
    where: { userId },
    data: {
      coverPhotoUrl,
      coverPhotoProfile: normalizePhotoProfile(coverPhotoProfile),
    },
  });

  return {
    coverPhotoUrl: updatedProfile.coverPhotoUrl,
    coverPhotoProfile: updatedProfile.coverPhotoProfile,
    updatedAt: updatedProfile.updatedAt,
  };
};

const getUserProfileById = async (userId, currentUserId) => {
  const resolvedCurrentUserId = currentUserId || "00000000-0000-0000-0000-000000000000";
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          followers: {
            where: { followerId: resolvedCurrentUserId },
            select: { followerId: true }
          },
          _count: {
            select: {
              followers: true,
              following: true,
              workoutSessions: {
                where: { status: "completed" }
              }
            }
          }
        }
      }
    }
  });

  if (!profile) {
    throw new AppError("Không tìm thấy thông tin hồ sơ người dùng.", httpCodes.notFound);
  }

  const isFollowing = profile.user.followers.length > 0;
  const followersCount = profile.user._count.followers;
  const followingCount = profile.user._count.following;
  const workoutsCount = profile.user._count.workoutSessions;

  const displayHeight = convertFromStandard(profile.heightCm, profile.heightUnit, "height");
  const displayWeight = convertFromStandard(profile.weightKg, profile.weightUnit, "weight");

  const progressPhotos = await prisma.progressPhoto.findMany({
    where: { userId, visibility: "public" },
    orderBy: { takenAt: "desc" }
  });

  const completedWorkouts = await prisma.workoutSession.findMany({
    where: { userId, status: "completed" },
    orderBy: { createdAt: "desc" },
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: true
        }
      }
    },
    take: 10
  });

  return {
    ...profile,
    displayHeight,
    displayWeight,
    followersCount,
    followingCount,
    workoutsCount,
    isFollowing,
    progressPhotos,
    completedWorkouts
  };
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  uploadCover,
  updateAvatarPhoto,
  updateCoverPhoto,
  getUserProfileById,
};
