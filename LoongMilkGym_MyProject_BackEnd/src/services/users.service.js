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

const uploadAvatar = async (userId, file) => {
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
  if (currentProfile && currentProfile.avatarUrl) {
    await deleteOldImage(currentProfile.avatarUrl);
  }

  // 3. Cập nhật URL ảnh đại diện mới vào cơ sở dữ liệu
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
