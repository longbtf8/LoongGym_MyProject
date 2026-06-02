/**
 * Dữ liệu tĩnh và tiện ích bổ trợ cho Hồ sơ cá nhân (PersonalInfoSection)
 */

export const GENDER_OPTIONS = ["Nam", "Nữ", "Khác"];

export const FITNESS_LEVEL_OPTIONS = [
  { value: "", label: "-- Chưa chọn --" },
  { value: "SEDENTARY (Ít vận động / Người mới)", label: "Người mới" },
  { value: "LIGHT (Vận động nhẹ / 1-2 buổi/tuần)", label: "Vận động nhẹ / 1-2 buổi/tuần" },
  { value: "MODERATE (Vận động vừa phải / 3-5 buổi/tuần)", label: "Vận động vừa phải / 3-5 buổi/tuần" },
  { value: "ACTIVE (Vận động nhiều / 6-7 buổi/tuần)", label: "Vận động nhiều / 6-7 buổi/tuần" },
  { value: "ATHLETE (Vận động viên / Cường độ cao)", label: "Vận động viên / Cường độ cao" }
];

export const GOAL_OPTIONS = [
  { value: "", label: "-- Chưa chọn --" },
  { value: "Giảm mỡ / Giảm cân", label: "Giảm mỡ / Giảm cân" },
  { value: "Tăng cơ bắp", label: "Tăng cơ bắp" },
  { value: "Nâng cao sức bền", label: "Nâng cao sức bền" },
  { value: "Cải thiện sức khỏe tổng thể", label: "Cải thiện sức khỏe tổng thể" },
  { value: "Phục hồi chức năng", label: "Phục hồi chức năng" }
];

export const HEIGHT_UNIT_OPTIONS = ["cm", "inch", "ft"];

export const WEIGHT_UNIT_OPTIONS = ["kg", "lb", "st"];

/**
 * Hàm lấy nhãn thể chất thuần Việt khích lệ
 */
export const getFitnessLevelLabel = (level) => {
  if (!level) return "";
  if (level.includes("SEDENTARY")) return "Người mới";
  if (level.includes("LIGHT")) return "Vận động nhẹ";
  if (level.includes("MODERATE")) return "Vận động vừa phải";
  if (level.includes("ACTIVE")) return "Vận động nhiều";
  if (level.includes("ATHLETE")) return "Vận động viên";
  return level;
};
