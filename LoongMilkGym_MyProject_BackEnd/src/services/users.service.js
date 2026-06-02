const { prisma } = require("@/lib/prisma");
const { httpCodes } = require("@/config/constants");
const { convertToKg, convertToCm, convertFromStandard } = require("@/utils/unitConverter");

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
        }
      }
    }
  });

  if (!profile) {
    const error = new Error("Không tìm thấy thông tin hồ sơ người dùng.");
    error.statusCode = httpCodes.notFound;
    throw error;
  }

  // Chuyển đổi và bổ sung các chỉ số đo lường hiển thị tùy chỉnh (Pound, Stone, Inch, Feet)
  const displayHeight = convertFromStandard(profile.heightCm, profile.heightUnit, "height");
  const displayWeight = convertFromStandard(profile.weightKg, profile.weightUnit, "weight");

  return {
    ...profile,
    displayHeight,
    displayWeight,
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
    const error = new Error("Không tìm thấy thông tin hồ sơ người dùng.");
    error.statusCode = httpCodes.notFound;
    throw error;
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

const uploadAvatar = async (userId, file) => {
  if (!file) {
    const error = new Error("Vui lòng tải lên một file hình ảnh.");
    error.statusCode = httpCodes.badRequest;
    throw error;
  }

  const avatarUrl = file.path || file.secure_url;

  if (!avatarUrl) {
    const error = new Error("Tải ảnh lên Cloudinary thất bại.");
    error.statusCode = httpCodes.badRequest;
    throw error;
  }

  const updatedProfile = await prisma.userProfile.update({
    where: { userId },
    data: { avatarUrl },
  });

  return {
    avatarUrl: updatedProfile.avatarUrl,
    updatedAt: updatedProfile.updatedAt,
  };
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
};
