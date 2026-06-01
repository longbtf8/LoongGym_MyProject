import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Custom hook quản lý trạng thái form và các hành động chỉnh sửa hồ sơ tài khoản.
 * Giúp giải phóng logic khỏi file Profile index chính, tăng tính tái sử dụng và dễ bảo trì.
 */
export function useProfileForm() {
  const { userInfo, handleLogout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Khởi tạo state form rỗng
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    birthDate: "",
    gender: "",
    address: "",
    weight: "",
    height: "",
    calorieGoal: "",
  });

  // Helper đồng bộ thông tin từ Auth User sang Form Data
  const syncUserInfoToForm = () => {
    if (userInfo) {
      setFormData({
        fullName: userInfo.profile?.fullName || userInfo.fullname || "Bùi Thành Long",
        phone: userInfo.profile?.phone || "+84 987 654 321",
        birthDate: userInfo.profile?.birthDate
          ? new Date(userInfo.profile.birthDate).toISOString().split("T")[0]
          : "2005-12-31",
        gender: userInfo.profile?.gender || "Nam",
        address: userInfo.profile?.address || "Hà Nội, Việt Nam",
        weight: userInfo.profile?.weightKg || "72",
        height: userInfo.profile?.heightCm || "178",
        calorieGoal: userInfo.profile?.calorieGoal || "2800",
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

  const handleSave = () => {
    // Ở đây sẽ gọi API lưu thay đổi trong tương lai
    setIsEditing(false);
  };

  const handleCancel = () => {
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

  return {
    userInfo,
    formData,
    isEditing,
    setIsEditing,
    handleChange,
    handleSave,
    handleCancel,
    formatDateDisplay,
    handleLogout,
  };
}
