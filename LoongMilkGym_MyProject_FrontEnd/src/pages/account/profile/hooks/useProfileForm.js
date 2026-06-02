import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateProfileMutation } from "@/services/auth/authApi";
import { parseApiError } from "@/utils/errorParser";

/**
 * Custom hook quản lý trạng thái form và các hành động chỉnh sửa hồ sơ tài khoản.
 * Giúp giải phóng logic khỏi file Profile index chính, tăng tính tái sử dụng và dễ bảo trì.
 */
export function useProfileForm() {
  const { userInfo, handleLogout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  // Khởi tạo state form rỗng
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    birthDate: "",
    gender: "",
    address: "",
    weight: "",
    height: "",
    weightUnit: "kg",
    heightUnit: "cm",
    fitnessLevel: "",
    goal: "",
    bio: "",
    membershipTier: "Standard",
    calorieGoal: "",
  });

  // Helper đồng bộ thông tin từ Auth User sang Form Data (sạch dữ liệu mẫu)
  const syncUserInfoToForm = () => {
    if (userInfo) {
      setFormData({
        fullName: userInfo.profile?.fullName || userInfo.fullname || "",
        phone: userInfo.profile?.phone || "",
        birthDate: userInfo.profile?.birthDate
          ? new Date(userInfo.profile.birthDate).toISOString().split("T")[0]
          : "",
        gender: userInfo.profile?.gender || "",
        address: userInfo.profile?.address || "",
        weight: userInfo.profile?.displayWeight !== undefined && userInfo.profile?.displayWeight !== null 
          ? userInfo.profile.displayWeight 
          : (userInfo.profile?.weightKg || ""),
        height: userInfo.profile?.displayHeight !== undefined && userInfo.profile?.displayHeight !== null 
          ? userInfo.profile.displayHeight 
          : (userInfo.profile?.heightCm || ""),
        weightUnit: userInfo.profile?.weightUnit || "kg",
        heightUnit: userInfo.profile?.heightUnit || "cm",
        fitnessLevel: userInfo.profile?.fitnessLevel || "",
        goal: userInfo.profile?.goal || "",
        bio: userInfo.profile?.bio || "",
        membershipTier: userInfo.profile?.membershipTier || "Standard",
        calorieGoal: userInfo.profile?.calorieGoal !== undefined && userInfo.profile?.calorieGoal !== null 
          ? userInfo.profile.calorieGoal 
          : "",
      });
    }
  };

  // Tự động đồng bộ dữ liệu khi tải trang hoặc userInfo thay đổi
  useEffect(() => {
    syncUserInfoToForm();
  }, [userInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setErrorMessage("");
      await updateProfile(formData).unwrap();
      setIsEditing(false);
    } catch (err) {
      console.error("Cập nhật hồ sơ thất bại:", err);
      const parsedError = parseApiError(err, "Cập nhật hồ sơ thất bại, vui lòng kiểm tra lại dữ liệu.");
      setErrorMessage(parsedError.message);
    }
  };

  const handleCancel = () => {
    setErrorMessage("");
    setIsEditing(false);
    syncUserInfoToForm();
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  const handleStartEditing = () => {
    setErrorMessage("");
    setIsEditing(true);
  };

  return {
    userInfo,
    formData,
    isEditing,
    setIsEditing: handleStartEditing,
    handleChange,
    handleSave,
    handleCancel,
    formatDateDisplay,
    handleLogout,
    isSaving,
    errorMessage,
    setErrorMessage,
  };
}
