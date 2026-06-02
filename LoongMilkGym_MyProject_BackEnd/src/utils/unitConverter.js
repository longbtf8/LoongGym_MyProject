/**
 * Tiện ích chuyển đổi đơn vị đo lường (Weight/Height)
 */

/**
 * Chuyển đổi cân nặng từ các đơn vị khác (Pound, Stone) về Kg để lưu trữ DB
 * @param {number|string} value - Giá trị cân nặng
 * @param {string} unit - Đơn vị gốc ("kg", "lb", "st")
 * @returns {number|null} - Cân nặng tính bằng Kg
 */
const convertToKg = (value, unit) => {
  if (value === null || value === undefined) return null;
  const numVal = Number(value);
  if (isNaN(numVal)) return null;

  switch (unit?.toLowerCase()) {
    case "lb":
    case "pound":
    case "pounds":
      return numVal * 0.45359237;
    case "st":
    case "stone":
    case "stones":
      return numVal * 6.35029318;
    case "kg":
    default:
      return numVal;
  }
};

/**
 * Chuyển đổi chiều cao từ các đơn vị khác (Inch, Feet) về Cm để lưu trữ DB
 * @param {number|string} value - Giá trị chiều cao
 * @param {string} unit - Đơn vị gốc ("cm", "inch", "ft")
 * @returns {number|null} - Chiều cao tính bằng Cm
 */
const convertToCm = (value, unit) => {
  if (value === null || value === undefined) return null;
  const numVal = Number(value);
  if (isNaN(numVal)) return null;

  switch (unit?.toLowerCase()) {
    case "inch":
    case "in":
    case "inches":
      return numVal * 2.54;
    case "ft":
    case "feet":
      return numVal * 30.48;
    case "cm":
    default:
      return numVal;
  }
};

/**
 * Chuyển đổi từ đơn vị chuẩn trong DB (kg/cm) ra đơn vị hiển thị mong muốn của người dùng
 * @param {number|string} value - Giá trị chuẩn trong DB (Kg hoặc Cm)
 * @param {string} unit - Đơn vị mong muốn hiển thị
 * @param {"weight"|"height"} type - Kiểu đo lường
 * @returns {number|null} - Giá trị sau khi quy đổi (làm tròn 2 chữ số thập phân)
 */
const convertFromStandard = (value, unit, type) => {
  if (value === null || value === undefined) return null;
  const numVal = Number(value);
  if (isNaN(numVal)) return null;

  if (type === "weight") {
    switch (unit?.toLowerCase()) {
      case "lb":
      case "pound":
      case "pounds":
        return Math.round((numVal / 0.45359237) * 100) / 100;
      case "st":
      case "stone":
      case "stones":
        return Math.round((numVal / 6.35029318) * 100) / 100;
      case "kg":
      default:
        return numVal;
    }
  } else {
    // Chiều cao
    switch (unit?.toLowerCase()) {
      case "inch":
      case "in":
      case "inches":
        return Math.round((numVal / 2.54) * 100) / 100;
      case "ft":
      case "feet":
        return Math.round((numVal / 30.48) * 100) / 100;
      case "cm":
      default:
        return numVal;
    }
  }
};

module.exports = {
  convertToKg,
  convertToCm,
  convertFromStandard,
};
